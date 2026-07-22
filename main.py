from typing import Optional

from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request

from hf_service import generate_image

app = FastAPI(title="AI Image Generator")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

templates = Jinja2Templates(directory="frontend")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


@app.post("/generate")
async def generate(
    prompt: str = Form(...),
    negative_prompt: str = Form(""),
    style: str = Form("none"),
    aspect_ratio: str = Form("1:1"),
    seed: Optional[int] = Form(None),
):
    try:
        image = generate_image(
            prompt=prompt,
            negative_prompt=negative_prompt or None,
            style=style,
            aspect_ratio=aspect_ratio,
            seed=seed,
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Image generation failed: {exc}"}
        )

    return Response(
        content=image,
        media_type="image/png"
    )