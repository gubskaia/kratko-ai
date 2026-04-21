import os
import mimetypes
from django.conf import settings
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY,
)

def extract_text(file_path: str) -> str:
    """Извлечение текста из файла"""
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
        return "Аудиофайлы пока не поддерживаются в бесплатной версии."

    else:
        raise ValueError(f"Неподдерживаемый формат: {ext}")


def summarize_text(text: str) -> str:
    """Пересказ через OpenRouter — бесплатная модель"""
    try:
        response = client.chat.completions.create(
            # Надёжная бесплатная модель на март 2026
            model="stepfun/step-3.5-flash:free",
            # Альтернативы (можно поменять):
            # model="nvidia/nemotron-3-super-120b-a12b:free"
            # model="meta-llama/llama-3.3-70b-instruct:free"

            messages=[
                {
                    "role": "system",
                    "content": "Ты — профессиональный помощник. Сделай краткий, но полный и хорошо структурированный пересказ текста на русском языке. Используй заголовки, списки и выдели ключевые моменты."
                },
                {
                    "role": "user",
                    "content": f"Текст для пересказа:\n\n{text[:110000]}"
                }
            ],
            max_tokens=1200,
            temperature=0.4,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        error_str = str(e).lower()
        if "429" in error_str or "quota" in error_str:
            raise Exception("Лимит бесплатных запросов исчерпан. Подожди 1-2 минуты и попробуй снова.")
        elif "404" in error_str or "not found" in error_str:
            raise Exception("Модель временно недоступна. Попробуй позже.")
        else:
            raise Exception(f"Ошибка OpenRouter: {str(e)}")


def process_uploaded_file(instance):
    """Основная функция обработки"""
    file_path = instance.file.path
    instance.file_type = mimetypes.guess_type(file_path)[0] or ""
    instance.status = 'processing'
    instance.save(update_fields=['file_type', 'status'])

    try:
        raw_text = extract_text(file_path)
        instance.extracted_text = raw_text[:8000]
        instance.summary = summarize_text(raw_text)
        instance.status = 'completed'
    except Exception as e:
        instance.status = 'failed'
        instance.error_message = str(e)
        print(f"Ошибка обработки: {e}")
    finally:
        instance.save(update_fields=['extracted_text', 'summary', 'status', 'error_message'])