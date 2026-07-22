from io import BytesIO
from typing import Optional

from huggingface_hub import InferenceClient

from config import HF_TOKEN, MODEL_NAME


client = InferenceClient(
    api_key=HF_TOKEN
)


STYLE_SUFFIXES = {
    "photorealistic": ", photorealistic, highly detailed, sharp focus, professional photography",
    "anime": ", anime style, vibrant colors, cel shading, studio anime artwork",
    "digital-art": ", digital art, trending on artstation, concept art, vivid colors",
    "oil-painting": ", oil painting, textured brushstrokes, classical painting style",
    "sketch": ", pencil sketch, hand-drawn, monochrome line art",
}


ASPECT_RATIOS = {
    "1:1": (1024, 1024),
    "16:9": (1344, 768),
    "9:16": (768, 1344),
    "4:3": (1152, 896),
}


def generate_image(
    prompt: str,
    negative_prompt: Optional[str] = None,
    style: str = "none",
    aspect_ratio: str = "1:1",
    seed: Optional[int] = None,
):
    full_prompt = prompt + STYLE_SUFFIXES.get(style, "")
    width, height = ASPECT_RATIOS.get(aspect_ratio, (1024, 1024))

   
    full_kwargs = {"width": width, "height": height}
    if negative_prompt:
        full_kwargs["negative_prompt"] = negative_prompt
    if seed is not None:
        full_kwargs["seed"] = seed

    without_negative = {k: v for k, v in full_kwargs.items() if k != "negative_prompt"}

    attempts = [full_kwargs, without_negative, {}]

    image = None
    last_error = None

    for kwargs in attempts:
        try:
            image = client.text_to_image(full_prompt, model=MODEL_NAME, **kwargs)
            last_error = None
            break
        except Exception as exc:
            last_error = exc
            continue

    if image is None:
       
        raise last_error

    buffer = BytesIO()
    image.save(buffer, format="PNG")

    return buffer.getvalue()