import os
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_NAME = os.getenv(
    "MODEL_NAME",
    "black-forest-labs/FLUX.1-schnell"
)