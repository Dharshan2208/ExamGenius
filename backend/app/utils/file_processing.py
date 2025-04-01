import io
from fastapi import UploadFile
import PyPDF2
import docx

async def extract_text_from_file(file: UploadFile) -> str:
    """Extracts text content from uploaded file (PDF or DOCX)."""
    content_type = file.content_type
    file_bytes = await file.read()
    await file.seek(0) # Reset file pointer if needed elsewhere

    text_content = ""

    try:
        if content_type == "application/pdf":
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                text_content += page.extract_text() or ""
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text_content += para.text + "\n"
        elif content_type == "text/plain":
            text_content = file_bytes.decode('utf-8')
        else:
            # Handle other potential types or raise an error
            # For now, try decoding as UTF-8 as a fallback
            try:
                text_content = file_bytes.decode('utf-8')
            except UnicodeDecodeError:
                 raise ValueError(f"Unsupported file type: {content_type}. Please upload PDF, DOCX, or TXT.")

    except Exception as e:
        print(f"Error extracting text from {file.filename}: {e}")
        raise ValueError(f"Could not process the uploaded file. Ensure it is a valid PDF, DOCX, or TXT file.") from e

    if not text_content.strip():
        raise ValueError("Extracted text content is empty. The file might be empty, corrupted, or image-based.")

    return text_content