
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse


BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
DATASETS_FILE = os.path.join(DATA_DIR, "datasets.json")
FILES_DIR = os.path.join(BASE_DIR, "datasets")
MAX_FILE_SIZE_MB = 100
ALLOWED_EXTENSIONS = {".csv", ".json", ".xml", ".xlsx", ".xls", ".pdf", ".tsv", ".zip"}


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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def redirect_to_app() -> RedirectResponse:
    return RedirectResponse("http://localhost:5173/", status_code=307)


@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
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

    with open(full_path, "wb") as handle:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            written += len(chunk)
            if written > size_limit:
                try:
                    os.remove(full_path)
                except FileNotFoundError:
                    pass
                raise HTTPException(status_code=413, detail="File too large")
            handle.write(chunk)

    relative_path = f"/datasets/{subject}/{source}/{today}/{filename}"

    return {
        "success": True,
        "message": "Dataset uploaded",
        "fileUrl": relative_path,
        "fileSize": written,
        "contentType": file.content_type,
    }