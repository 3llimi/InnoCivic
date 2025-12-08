import json
import os
import time
import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query, UploadFile, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import httpx
import uuid

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
DATASETS_FILE = os.path.join(DATA_DIR, "datasets.json")
FILES_DIR = os.path.join(BASE_DIR, "datasets")
MAX_FILE_SIZE_MB = 1000
ALLOWED_EXTENSIONS = {".csv", ".json", ".xml", ".xlsx", ".xls", ".pdf", ".tsv", ".zip"}

# ========== GIGACHAT CONFIGURATION ==========
# ВАШ КЛЮЧ
GIGACHAT_AUTH_KEY = "MDE5YWY0MzMtYmI3ZS03NTA0LWE5OTAtYzg0ZTUyZDQ1ZTVkOmZlMTFiZTliLWQxMWItNDU4YS1hZTljLTUzYWRlM2MwYjE2Nw=="

GIGACHAT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
GIGACHAT_API_URL = "https://gigachat.devices.sberbank.ru/api/v1"

# Глобальные переменные для токена и rate limiting
access_token = None
token_expiry = None
last_request_time = None
request_queue = asyncio.Queue()
MAX_REQUESTS_PER_MINUTE = 10  # Ограничение запросов

async def get_gigachat_token() -> Optional[str]:
    """Получение access token для GigaChat API"""
    global access_token, token_expiry
    
    # Если токен еще действителен
    if access_token and token_expiry and datetime.now() < token_expiry:
        return access_token
    
    print("🔄 Получаем новый токен GigaChat...")
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "Authorization": f"Basic {GIGACHAT_AUTH_KEY}",
        "RqUID": str(uuid.uuid4())
    }
    
    data = {"scope": "GIGACHAT_API_PERS"}
    
    try:
        async with httpx.AsyncClient(verify=False, timeout=30.0) as client:
            response = await client.post(GIGACHAT_AUTH_URL, headers=headers, data=data)
            
            if response.status_code == 200:
                token_data = response.json()
                access_token = token_data.get("access_token")
                
                if access_token:
                    token_expiry = datetime.now() + timedelta(minutes=29)
                    print(f"✅ Токен получен успешно")
                    return access_token
                else:
                    print(f"❌ Токен не найден в ответе: {token_data}")
            else:
                print(f"❌ Ошибка получения токена: {response.status_code}")
                print(f"Ответ: {response.text[:200]}")
                
    except Exception as e:
        print(f"❌ Ошибка сети при получении токена: {str(e)}")
    
    return None

async def rate_limiter():
    """Rate limiter для избежания 429 ошибок"""
    global last_request_time
    
    if last_request_time:
        elapsed = (datetime.now() - last_request_time).total_seconds()
        if elapsed < 6.0:  # Минимум 6 секунд между запросами (10 запросов в минуту)
            wait_time = 6.0 - elapsed
            print(f"⏳ Rate limiting: ждем {wait_time:.1f} секунд")
            await asyncio.sleep(wait_time)
    
    last_request_time = datetime.now()

async def ask_gigachat_simple(prompt: str) -> str:
    """Простой запрос к GigaChat"""
    await rate_limiter()
    
    token = await get_gigachat_token()
    if not token:
        return "Ошибка: не удалось получить токен доступа"
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    payload = {
        "model": "GigaChat",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    url = f"{GIGACHAT_API_URL}/chat/completions"
    
    try:
        async with httpx.AsyncClient(verify=False, timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                return result.get("choices", [{}])[0].get("message", {}).get("content", "")
            else:
                print(f"❌ Ошибка GigaChat: {response.status_code}")
                return f"Ошибка API: {response.status_code}"
                
    except Exception as e:
        print(f"❌ Ошибка сети: {str(e)}")
        return f"Ошибка сети: {str(e)}"

# ========== ХРАНЕНИЕ ДАННЫХ ==========
def _ensure_storage() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(FILES_DIR, exist_ok=True)
    if not os.path.exists(DATASETS_FILE):
        with open(DATASETS_FILE, "w", encoding="utf-8") as handle:
            handle.write("[]")

def _load_datasets() -> List[Dict[str, Any]]:
    if not os.path.exists(DATASETS_FILE):
        return []
    with open(DATASETS_FILE, "r", encoding="utf-8") as handle:
        return json.load(handle)

def _save_datasets(datasets: List[Dict[str, Any]]) -> None:
    with open(DATASETS_FILE, "w", encoding="utf-8") as handle:
        json.dump(datasets, handle, indent=2, ensure_ascii=False)

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

# ========== FASTAPI APP ==========
app = FastAPI(
    title="InnoCivic API",
    description="Minimal backend for the InnoCivic civic data hub.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== STATIC FILES ==========
from fastapi.staticfiles import StaticFiles

static_dir = os.path.join(BASE_DIR, "static")
os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

# ========== ОСНОВНЫЕ ENDPOINTS ==========
@app.get("/")
async def root():
    return {
        "message": "InnoCivic API",
        "version": "0.2.0",
        "ai_enabled": bool(GIGACHAT_AUTH_KEY),
        "endpoints": {
            "health": "/api/health",
            "ai_test": "/api/ai/test",
            "ai_chat": "/api/ai/chat (POST)",
            "datasets": "/api/datasets"
        }
    }

@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ai_enabled": bool(GIGACHAT_AUTH_KEY),
    }

# ========== AI ENDPOINTS ==========
@app.post("/api/ai/chat")
async def ai_chat(request: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """AI chat endpoint for dataset analysis and Q&A"""
    print("\n" + "="*60)
    print("📨 AI CHAT REQUEST")
    print("="*60)
    
    try:
        # Извлекаем данные
        messages = request.get("messages", [])
        dataset_context = request.get("dataset_context", {})
        system_prompt = request.get("system_prompt", "")
        
        if not messages:
            return {
                "success": False,
                "error": "No messages provided"
            }
        
        # Берем последнее сообщение пользователя
        last_message = None
        for msg in reversed(messages):
            if isinstance(msg, dict) and msg.get("role") == "user":
                last_message = msg.get("content", "")
                break
        
        if not last_message:
            last_message = messages[-1].get("content", "") if messages else ""
        
        print(f"💬 Последнее сообщение: {last_message[:100]}...")
        
        # Создаем промпт для AI
        prompt = f"""{system_prompt}

Контекст датасета:
{json.dumps(dataset_context, indent=2, ensure_ascii=False)}

Запрос пользователя: {last_message}

Отвечай на английcком языке, будь полезным и точным."""
        
        print(f"🤖 Отправляем запрос к GigaChat...")
        ai_response = await ask_gigachat_simple(prompt)
        
        print(f"✅ Ответ получен: {ai_response[:100]}...")
        
        return {
            "success": True,
            "response": ai_response,
            "model": "GigaChat"
        }
        
    except Exception as e:
        print(f"❌ Ошибка: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/ai/test")
async def test_ai():
    """Test endpoint to check if GigaChat is working"""
    print("\n🔍 Testing GigaChat...")
    
    try:
        response = await ask_gigachat_simple("Привет! Ответь '✅ GigaChat работает!' если ты функционируешь.")
        
        return {
            "success": True,
            "message": "GigaChat is working!",
            "response": response
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "GigaChat test failed"
        }

# ========== СПЕЦИАЛЬНЫЕ AI ENDPOINTS ДЛЯ ДАТАСЕТОВ ==========
@app.post("/api/ai/generate-description")
async def generate_description(request: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """Generate AI description for a dataset"""
    try:
        dataset = request.get("dataset", {})
        
        prompt = f"""Создай краткое описание для этого датасета на русском языке (2-3 предложения).

Информация о датасете:
- Название: {dataset.get('title', 'Не указано')}
- Описание: {dataset.get('description', 'Не указано')}
- Категория: {dataset.get('category', 'Не указано')}
- Формат: {dataset.get('format', 'Не указано')}
- Источник: {dataset.get('source', 'Не указано')}

Описание должно быть кратким, информативным и полезным для пользователей."""
        
        response = await ask_gigachat_simple(prompt)
        
        return {
            "success": True,
            "description": response
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/api/ai/dataset-summary")
async def dataset_summary(request: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """Generate AI summary for a dataset"""
    try:
        dataset = request.get("dataset", {})
        
        prompt = f"""Создай краткое резюме для этого набора данных на русском языке.

Название: {dataset.get('title', 'Не указано')}
Описание: {dataset.get('description', 'Не указано')}

Резюме должно:
1. Объяснить, что содержит датасет
2. Указать основную ценность данных
3. Предложить возможные варианты использования

Ответь 3-4 предложениями."""
        
        response = await ask_gigachat_simple(prompt)
        
        return {
            "success": True,
            "summary": response
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# ========== DATASET ENDPOINTS ==========
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
    
    filtered = []
    for dataset in datasets:
        if search:
            search_text = f"{dataset.get('title', '')} {dataset.get('description', '')} {' '.join(dataset.get('tags', []))}".lower()
            if search.lower() not in search_text:
                continue
        if category and dataset.get("category", {}).get("id") != category:
            continue
        if format and dataset.get("format") != format:
            continue
        if tag and tag not in dataset.get("tags", []):
            continue
        filtered.append(dataset)
    
    filtered.sort(key=lambda x: x.get("uploadedAt", ""), reverse=True)
    
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

# ========== ЗАПУСК ==========
if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*60)
    print("🚀 INNOCIVIC API")
    print("="*60)
    print(f"🔑 GigaChat: {'✅ Настроен' if GIGACHAT_AUTH_KEY else '❌ Не настроен'}")
    print(f"🌐 Port: 8000")
    print(f"📁 Data: {DATA_DIR}")
    print("="*60)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)