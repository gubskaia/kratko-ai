import mimetypes
import os
import logging

from django.conf import settings
from openai import OpenAI

from .models import UploadedFile


logger = logging.getLogger(__name__)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY,
)

OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")
OPENROUTER_FALLBACK_MODELS = [
    model.strip()
    for model in os.getenv("OPENROUTER_FALLBACK_MODELS", "").split(",")
    if model.strip()
]


def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as file_obj:
            return file_obj.read()

    if ext == ".pdf":
        try:
            from pypdf import PdfReader
        except ImportError:
            try:
                from PyPDF2 import PdfReader
            except ImportError as exc:
                raise ImportError(
                    "PDF support is not installed. Install `pypdf` in the backend environment."
                ) from exc

        reader = PdfReader(file_path)
        return "".join(page.extract_text() or "" for page in reader.pages)

    if ext == ".docx":
        from docx import Document

        document = Document(file_path)
        return "\n".join(paragraph.text for paragraph in document.paragraphs)

    if ext in [".mp3", ".wav"]:
        return "Audio files are not supported in this version."

    raise ValueError(f"Unsupported file format: {ext}")


def summarize_text(text: str) -> str:
    normalized_text = "\n".join(
        line.strip() for line in text.replace("\r\n", "\n").splitlines() if line.strip()
    )

    request_kwargs = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Ты профессиональный редактор и помощник по краткому пересказу текста. "
                    "Всегда отвечай на грамотном, естественном русском языке без канцелярита, "
                    "ломаных формулировок и выдуманных деталей.\n\n"
                    "Строго соблюдай эту структуру ответа:\n\n"
                    "**Общая характеристика**\n"
                    "1 короткий абзац на 2-3 предложения с понятным пересказом сути текста.\n\n"
                    "**Основные моменты**\n"
                    "- 2-4 кратких пункта по делу\n\n"
                    "**Вывод**\n"
                    "1 короткое итоговое предложение.\n\n"
                    "Правила:\n"
                    "- Не добавляй факты, которых нет в исходном тексте.\n"
                    "- Пиши просто, связно и естественно.\n"
                    "- Если исходный текст уже короткий, делай аккуратный пересказ без чрезмерного сжатия.\n"
                    "- Не добавляй никаких других заголовков или секций."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Сделай краткий и грамотный пересказ этого текста:\n\n"
                    f"{normalized_text[:110000]}"
                ),
            },
        ],
        "max_tokens": 1200,
        "temperature": 0.2,
    }

    if OPENROUTER_FALLBACK_MODELS:
        request_kwargs["extra_body"] = {"models": OPENROUTER_FALLBACK_MODELS}

    try:
        response = client.chat.completions.create(**request_kwargs)
        return response.choices[0].message.content.strip()
    except Exception as exc:
        error_str = str(exc).lower()
        if "429" in error_str or "quota" in error_str:
            raise Exception("Free OpenRouter quota is temporarily exhausted. Try again in 1-2 minutes.") from exc
        if "404" in error_str or "not found" in error_str:
            raise Exception(
                f"OpenRouter model is unavailable: {OPENROUTER_MODEL}. "
                "Try again later or change OPENROUTER_MODEL in back/.env."
            ) from exc
        raise Exception(f"OpenRouter error: {exc}") from exc


def process_uploaded_file(instance):
    file_path = instance.file.path
    instance.file_type = mimetypes.guess_type(file_path)[0] or ""
    instance.status = UploadedFile.Status.PROCESSING
    instance.save(update_fields=["file_type", "status"])

    try:
        raw_text = extract_text(file_path)
        instance.extracted_text = raw_text[:8000]
        instance.summary = summarize_text(raw_text)
        instance.status = UploadedFile.Status.COMPLETED
        instance.error_message = ""
    except Exception as exc:
        instance.status = UploadedFile.Status.FAILED
        instance.error_message = str(exc)
        logger.exception("File processing failed", extra={"uploaded_file_id": instance.pk})
    finally:
        instance.save(update_fields=["extracted_text", "summary", "status", "error_message"])
