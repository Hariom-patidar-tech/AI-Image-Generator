# 🎨  AI –  AI Image Generator

<p align="center">

<img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white">
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white">
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

</p>

<p align="center">

A beautiful AI-powered image generation web application inspired by the classic darkroom photography experience. Users simply enter a text prompt, choose a preferred artistic style, and generate high-quality AI images in seconds.

</p>

---

# ✨ Features

- 🎨 Generate AI images from text prompts
- 🖼️ Multiple image generation styles
  - Photoreal
  - Anime
  - Digital Art
  - Oil Painting
  - Sketch
- ⚙️ Advanced generation options
  - Negative Prompt
  - Aspect Ratio
  - Seed Value
- 📥 Download generated images
- 🔄 Regenerate images instantly
- 📱 Responsive modern UI
- ⚡ FastAPI backend
- 🎯 Clean and minimal Darkroom-inspired design

---

# 📸 Interface
<img width="718" height="452" alt="image" src="https://github.com/user-attachments/assets/2824f68a-8464-4516-9a4b-bd95746ccb05" />
<img width="760" height="452" alt="image" src="https://github.com/user-attachments/assets/e21e9c42-3999-48bd-8c12-66f7f370d7d3" />


## Prompt Panel

- Enter text prompt
- Select image style
- Configure advanced options
- Generate image

## Preview Panel

- Live generated image
- Download button
- Regenerate button

---

# 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- FastAPI
- Python

### AI Model

- Hugging Face Diffusers
- Stable Diffusion
- Transformers

---

# 📂 Project Structure

```text
Darkroom-AI/
│
├── backend/
│   ├── app.py
│   ├── model.py
│   ├── requirements.txt
│   └── utils.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│
├── generated_images/
│
├── README.md
└── requirements.txt
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/AI-Image-Generator.git

cd AI-Image-Generator
```

---


## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Run Backend

```bash
uvicorn app:app --reload
```

Backend runs on

```
http://127.0.0.1:8000
```

---

## Run Frontend

Open

```
frontend/index.html
```

or

Run Live Server in VS Code.

---

# ⚙️ API

## Generate Image

### POST

```
/generate
```

---

# 🎯 Workflow

```text
User Prompt
      │
      ▼
Frontend (HTML/CSS/JS)
      │
      ▼
FastAPI Backend
      │
      ▼
Stable Diffusion Model
      │
      ▼
Generated Image
      │
      ▼
Preview + Download
```

---

# Deploy on render

https://ai-image-generator-dg25.onrender.com

---

# 🌟 Highlights

- Elegant Darkroom-inspired UI
- Modern responsive design
- AI image generation
- Minimal and clean interface
- Download generated images
- Professional project architecture

---

# 📈 Future Improvements

- Image History
- Image Gallery
- Prompt Templates
- Image Upscaling
- Image Editing
- Authentication
- Cloud Storage
- Multiple AI Models
- Prompt Enhancement
- Batch Image Generation

---

# 👨‍💻 Author

**Hariom Patidar**

AI & Machine Learning Developer

GitHub:
https://github.com/Hariom-patidar-tech

LinkedIn:
https://www.linkedin.com/in/hariom-patidar-6574ba290/

---



---

# ⭐ Support

If you like this project, don't forget to ⭐ star the repository.

Happy Coding 
