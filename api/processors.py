import os
import mimetypes
from django.conf import settings
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def extract_text(file_path: str) -> str:
    """Извлечение текста из поддерживаемых форматов"""
    ext = os.path.splitext(file_path)[1].lower()

    if ext == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    elif ext == '.pdf':
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text

    elif ext == '.docx':
        from docx import Document
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs])

    elif ext in ['.mp3', '.wav']:
        with open(file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text",
                language="ru"
            )
        return transcript

    else:
        raise ValueError(f"Неподдерживаемый формат файла: {ext}")

def summarize_text(text: str) -> str:
    """Генерация пересказа через GPT-4o-mini"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "Ты — профессиональный помощник. Сделай краткий, но полный и структурированный пересказ текста на русском языке. Выдели ключевые моменты."
            },
            {
                "role": "user",
                "content": f"Текст для пересказа:\n\n{text[:120000]}"
            }
        ],
        max_tokens=1500,
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()

def process_uploaded_file(instance):
    """Основная функция обработки файла"""
    file_path = instance.file.path
    instance.file_type = mimetypes.guess_type(file_path)[0] or ""
    instance.status = 'processing'
    instance.save(update_fields=['file_type', 'status'])

    try:
        raw_text = extract_text(file_path)
        instance.extracted_text = raw_text[:10000]
        instance.summary = summarize_text(raw_text)
        instance.status = 'completed'
    except Exception as e:
        instance.status = 'failed'
        instance.error_message = str(e)
        raise
    finally:
        instance.save(update_fields=['extracted_text', 'summary', 'status', 'error_message'])