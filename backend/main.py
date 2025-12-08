
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from gigachat import GigaChat
from gigachat.models import Chat, Messages, MessagesRole
import httpx


BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
DATASETS_FILE = os.path.join(DATA_DIR, "datasets.json")
FILES_DIR = os.path.join(BASE_DIR, "datasets")
MAX_FILE_SIZE_MB = 1000  # Increased to 1GB for larger datasets
ALLOWED_EXTENSIONS = {".csv", ".json", ".xml", ".xlsx", ".xls", ".pdf", ".tsv", ".zip"}

# GigaChat API setup
GIGACHAT_API_KEY = os.getenv("GIGACHAT_API_KEY")
GIGACHAT_BASE_URL = os.getenv("GIGACHAT_BASE_URL", "https://gigachat.devices.sberbank.ru/api/v1")

# Initialize GigaChat client
gigachat_client = GigaChat(
    credentials=GIGACHAT_API_KEY,
    base_url=GIGACHAT_BASE_URL,
    verify_ssl_certs=False
) if GIGACHAT_API_KEY else None


def _ensure_storage() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(FILES_DIR, exist_ok=True)
    if not os.path.exists(DATASETS_FILE):
        with open(DATASETS_FILE, "w", encoding="utf-8") as handle:
            handle.write("[]")


def _load_datasets() -> List[Dict[str, Any]]:
    with open(DATASETS_FILE, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _save_datasets(datasets: List[Dict[str, Any]]) -> None:
    with open(DATASETS_FILE, "w", encoding="utf-8") as handle:
        json.dump(datasets, handle, indent=2)


def _find_dataset(datasets: List[Dict[str, Any]], dataset_id: str) -> Dict[str, Any]:
    for dataset in datasets:
        if dataset["id"] == dataset_id:
            return dataset
    raise HTTPException(status_code=404, detail="Dataset not found")


def _apply_updates(target: Dict[str, Any], updates: Dict[str, Any]) -> None:
    for key, value in updates.items():
        if value is not None:
            target[key] = value


_ensure_storage()

app = FastAPI(
    title="InnoCivic API",
    description="Minimal backend for the InnoCivic civic data hub.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.get("/")
# async def redirect_to_app() -> RedirectResponse:
#     return RedirectResponse("http://localhost:5173/", status_code=307)


@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ai_enabled": gigachat_client is not None,
    }


@app.post("/api/ai/chat")
async def ai_chat(payload: Dict[str, Any]) -> Dict[str, Any]:
    """AI chat endpoint for dataset analysis and Q&A"""
    if not gigachat_client:
        raise HTTPException(status_code=503, detail="AI service not available")

    messages = payload.get("messages", [])
    dataset_context = payload.get("dataset_context", {})
    system_prompt = payload.get("system_prompt", "")

    try:
        # Create system message with dataset context
        system_message = f"""You are an AI assistant for the InnoCivic civic data platform. You help users understand and analyze datasets.

{system_prompt}

Dataset Context:
{json.dumps(dataset_context, indent=2, ensure_ascii=False)}

Guidelines:
- Be helpful and accurate
- Explain complex data concepts in simple terms
- Suggest insights and analysis approaches
- Always be truthful about data limitations
- Use Russian language for responses since this is a Russian civic data platform
"""

        # Prepare messages for GigaChat
        chat_messages = [
            Messages(role=MessagesRole.SYSTEM, content=system_message)
        ]

        # Add conversation history
        for msg in messages[-10:]:  # Limit to last 10 messages to avoid token limits
            role = MessagesRole.USER if msg.get("role") == "user" else MessagesRole.ASSISTANT
            chat_messages.append(Messages(role=role, content=msg.get("content", "")))

        # Make API call
        response = gigachat_client.chat(chat_messages)

        return {
            "success": True,
            "response": response.choices[0].message.content,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@app.post("/api/ai/dataset-insights")
async def dataset_insights(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Generate AI insights for a dataset"""
    if not gigachat_client:
        raise HTTPException(status_code=503, detail="AI service not available")

    dataset = payload.get("dataset", {})
    preview_data = payload.get("preview_data", [])

    try:
        # Create comprehensive dataset analysis prompt
        analysis_prompt = f"""Проанализируйте этот набор данных и предоставьте полезные insights на русском языке.

Информация о датасете:
- Название: {dataset.get('title', 'Не указано')}
- Описание: {dataset.get('description', 'Не указано')}
- Категория: {dataset.get('category', {}).get('name', 'Не указано')}
- Формат: {dataset.get('format', 'Не указано')}
- Источник: {dataset.get('source', 'Не указано')}
- Географическое покрытие: {dataset.get('geographicCoverage', 'Не указано')}
- Временной период: {dataset.get('timePeriod', {}).get('start', 'Не указано')} - {dataset.get('timePeriod', {}).get('end', 'Не указано')}
- Теги: {', '.join(dataset.get('tags', []))}
- Качество: {dataset.get('qualityScore', 'Не указано')}/10

Превью данных (первые строки):
{json.dumps(preview_data[:5], indent=2, ensure_ascii=False) if preview_data else 'Превью данных недоступно'}

Пожалуйста, предоставьте:
1. Краткое описание того, что содержит этот датасет
2. Потенциальные сферы применения этих данных
3. Рекомендации по анализу
4. Возможные ограничения или предостережения
5. Предложения по визуализации

Ответьте на русском языке в структурированном формате."""

        messages = [Messages(role=MessagesRole.USER, content=analysis_prompt)]
        response = gigachat_client.chat(messages)

        return {
            "success": True,
            "insights": response.choices[0].message.content,
            "model": response.model,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis error: {str(e)}")


@app.post("/api/ai/generate-description")
async def generate_description(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Generate AI description for a dataset"""
    if not gigachat_client:
        raise HTTPException(status_code=503, detail="AI service not available")

    dataset = payload.get("dataset", {})
    preview_data = payload.get("preview_data", [])

    try:
        # Create description generation prompt
        description_prompt = f"""Создайте подробное описание для этого набора данных на русском языке.

Информация о датасете:
- Название: {dataset.get('title', 'Не указано')}
- Категория: {dataset.get('category', {}).get('name', 'Не указано')}
- Формат: {dataset.get('format', 'Не указано')}
- Источник: {dataset.get('source', 'Не указано')}
- Географическое покрытие: {dataset.get('geographicCoverage', 'Не указано')}
- Временной период: {dataset.get('timePeriod', {}).get('start', 'Не указано')} - {dataset.get('timePeriod', {}).get('end', 'Не указано')}
- Теги: {', '.join(dataset.get('tags', []))}

Структура данных (превью):
{json.dumps(preview_data[:3], indent=2, ensure_ascii=False) if preview_data else 'Структура данных недоступна'}

Создайте привлекательное и информативное описание, которое:
- Объясняет, что содержит датасет
- Указывает на ценность и полезность данных
- Описывает ключевые характеристики
- Упоминает потенциальные применения

Описание должно быть на русском языке и занимать 2-4 предложения."""

        messages = [Messages(role=MessagesRole.USER, content=description_prompt)]
        response = gigachat_client.chat(messages)

        return {
            "success": True,
            "description": response.choices[0].message.content,
            "model": response.model,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI description generation error: {str(e)}")



@app.get("/api/categories")
def list_categories() -> Dict[str, Any]:
    datasets = _load_datasets()
    buckets: Dict[str, Dict[str, Any]] = {}

    for dataset in datasets:
        category = dataset.get("category", {})
        category_id = category.get("id", "uncategorized")

        if category_id not in buckets:
            buckets[category_id] = {
                "id": category_id,
                "name": category.get("name", "Uncategorized"),
                "description": category.get("description", ""),
                "icon": category.get("icon"),
                "datasetCount": 0,
            }

        buckets[category_id]["datasetCount"] += 1

    return {
        "success": True,
        "data": list(buckets.values()),
        "total": len(buckets),
    }


@app.get("/api/datasets")
def list_datasets(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    format: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None),
) -> Dict[str, Any]:
    datasets = _load_datasets()

    def matches(dataset: Dict[str, Any]) -> bool:
        if search:
            needle = search.lower()
            haystack = " ".join(
                [
                    dataset.get("title", ""),
                    dataset.get("description", ""),
                    " ".join(dataset.get("tags", [])),
                ]
            ).lower()
            if needle not in haystack:
                return False
        if category:
            category_id = (dataset.get("category") or {}).get("id")
            if category_id != category:
                return False
        if format and dataset.get("format") != format:
            return False
        if tag and tag not in dataset.get("tags", []):
            return False
        return True

    filtered = [dataset for dataset in datasets if matches(dataset)]
    filtered.sort(key=lambda item: item.get("uploadedAt", ""), reverse=True)

    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    slice_ = filtered[start:end]

    return {
        "success": True,
        "data": slice_,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit if total else 0,
        },
    }


@app.get("/api/datasets/{dataset_id}")
def get_dataset(dataset_id: str) -> Dict[str, Any]:
    datasets = _load_datasets()
    dataset = _find_dataset(datasets, dataset_id)
    return {"success": True, "data": dataset}


@app.post("/api/datasets", status_code=201)
def create_dataset(payload: Dict[str, Any]) -> Dict[str, Any]:
    datasets = _load_datasets()

    if not payload.get("title"):
        raise HTTPException(status_code=400, detail="Title is required")

    dataset_id = str(uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    dataset = {
        "id": dataset_id,
        "title": payload.get("title"),
        "description": payload.get("description", ""),
        "category": payload.get("category"),
        "tags": payload.get("tags", []),
        "format": payload.get("format", "CSV"),
        "fileUrl": payload.get("fileUrl"),
        "fileSize": payload.get("fileSize", 0),
        "source": payload.get("source"),
        "license": payload.get("license"),
        "geographicCoverage": payload.get("geographicCoverage"),
        "timePeriod": payload.get("timePeriod"),
        "uploadedBy": payload.get("uploadedBy"),
        "uploadedAt": now,
        "lastUpdated": now,
        "downloadCount": payload.get("downloadCount", 0),
        "viewCount": payload.get("viewCount", 0),
        "qualityScore": payload.get("qualityScore", 0),
        "status": payload.get("status", "pending"),
        "metadata": payload.get("metadata", {}),
        "version": payload.get("version", "1.0"),
        "isPublic": payload.get("isPublic", True),
        "previewData": payload.get("previewData"),
    }

    datasets.append(dataset)
    _save_datasets(datasets)

    return {
        "success": True,
        "message": "Dataset created",
        "data": dataset,
    }


@app.patch("/api/datasets/{dataset_id}")
def update_dataset(dataset_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    datasets = _load_datasets()
    dataset = _find_dataset(datasets, dataset_id)

    _apply_updates(dataset, payload)
    dataset["lastUpdated"] = datetime.utcnow().isoformat() + "Z"

    _save_datasets(datasets)

    return {
        "success": True,
        "message": "Dataset updated",
        "data": dataset,
    }


@app.delete("/api/datasets/{dataset_id}", status_code=204)
def delete_dataset(dataset_id: str) -> None:
    datasets = _load_datasets()
    remaining = [dataset for dataset in datasets if dataset["id"] != dataset_id]

    if len(remaining) == len(datasets):
        raise HTTPException(status_code=404, detail="Dataset not found")

    _save_datasets(remaining)


@app.get("/api/datasets/{dataset_id}/download")
def download_dataset(dataset_id: str) -> FileResponse:
    datasets = _load_datasets()
    dataset = _find_dataset(datasets, dataset_id)
    file_url = dataset.get("fileUrl")

    if not file_url:
        raise HTTPException(status_code=404, detail="Dataset file missing")

    relative_part = file_url.lstrip("/datasets/")
    candidate_path = os.path.realpath(os.path.join(FILES_DIR, relative_part))
    if not candidate_path.startswith(os.path.realpath(FILES_DIR)):
        raise HTTPException(status_code=400, detail="Invalid dataset file location")

    if not os.path.exists(candidate_path):
        raise HTTPException(status_code=404, detail="Dataset file not found")

    dataset["downloadCount"] = dataset.get("downloadCount", 0) + 1
    dataset["lastUpdated"] = datetime.utcnow().isoformat() + "Z"
    _save_datasets(datasets)

    return FileResponse(candidate_path, filename=os.path.basename(candidate_path))


@app.post("/upload/{source}/{subject}")
async def upload_dataset(
    source: str,
    subject: str,
    file: UploadFile,
) -> Dict[str, Any]:
    filename = os.path.basename(file.filename or "")
    if not filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    today = datetime.utcnow().strftime("%Y-%m-%d")
    folder = os.path.join(FILES_DIR, subject, source, today)
    os.makedirs(folder, exist_ok=True)

    full_path = os.path.join(folder, filename)
    if os.path.exists(full_path):
        raise HTTPException(status_code=409, detail="Dataset file already exists")

    size_limit = MAX_FILE_SIZE_MB * 1024 * 1024
    written = 0

    try:
        with open(full_path, "wb") as handle:
            while True:
                chunk = await file.read(1024 * 1024)  # Read 1MB chunks
                if not chunk:
                    break
                written += len(chunk)
                if written > size_limit:
                    try:
                        os.remove(full_path)
                    except FileNotFoundError:
                        pass
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum size: {MAX_FILE_SIZE_MB}MB, received: {written / (1024*1024):.1f}MB"
                    )
                handle.write(chunk)

        relative_path = f"/datasets/{subject}/{source}/{today}/{filename}"

        return {
            "success": True,
            "message": "Dataset uploaded successfully",
            "fileUrl": relative_path,
            "fileSize": written,
            "contentType": file.content_type,
        }
    except Exception as e:
        # Clean up partial file on error
        try:
            if os.path.exists(full_path):
                os.remove(full_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")