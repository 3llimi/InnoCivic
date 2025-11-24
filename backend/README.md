# InnoCivic Backend

Small FastAPI service that powers dataset uploads and retrieval for the InnoCivic frontend.

## Run locally

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit:

- `http://localhost:8000/docs` – interactive API explorer
- `http://localhost:5173` – frontend (separate `npm run dev`)

## Endpoints

- `GET /api/health` – simple status check
- `GET /api/datasets` – list datasets with filters (`search`, `category`, `format`, `tag`, pagination)
- `GET /api/datasets/{id}` – fetch dataset details
- `POST /api/datasets` – create dataset entry
- `PATCH /api/datasets/{id}` – update entry
- `DELETE /api/datasets/{id}` – remove entry
- `GET /api/datasets/{id}/download` – download stored file and bump counter
- `POST /upload/{source}/{subject}` – upload dataset file (CSV, JSON, XML, XLSX, XLS, PDF, TSV, ZIP)
- `GET /api/categories` – grouped counts by category

## Storage

- Metadata: `backend/data/datasets.json`
- Files: `backend/datasets/<subject>/<source>/<YYYY-MM-DD>/<filename>`

Both folders are created automatically on startup. Uploaded files are limited to 100 MB.
