
import os.path
from datetime import datetime
from fastapi import FastAPI, UploadFile
from fastapi.responses import Response, FileResponse, RedirectResponse
from fastapi.requests import *
from http import HTTPStatus

dataset_exts: tuple[str] = (".csv")

app = FastAPI()

@app.get("/")
async def redirect_to_root() -> RedirectResponse:
    return RedirectResponse("http://localhost:5173/")

@app.post("/upload/{source}/{subject}")
async def upload_file(file: UploadFile, source: str, subject: str) -> Response:

    file_ext = os.path.splitext(file.filename)
    if not any([file_ext == ext for ext in dataset_exts]):
        return FileResponse(f"Invalid dataset file extension '{file_ext}'", status_code=HTTPStatus.BAD_REQUEST)

    date = datetime.now().strftime("%d.%m.%Y")
    dataset_dir = f"datasets/{subject}/{source}/{date}"
    dataset_path = os.path.join(dataset_dir, file.filename)

    if not os.path.exists(dataset_dir):
        os.makedirs(dataset_dir)

    if os.path.exists(dataset_path):
        return FileResponse(f"Dataset already exists", status_code=HTTPStatus.CONFLICT)

    with open(dataset_path, "wb") as f:
        f.write(await file.read())

    return Response("Successfully uploaded dataset")