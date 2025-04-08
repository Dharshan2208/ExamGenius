from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, HTMLResponse
from app.services.groq_service import analyze_syllabus
from app.utils.file_processing import extract_text_from_file
from app.models.syllabus import SyllabusAnalysisResponse
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/upload")
async def get_upload_page():
    """Return a simple HTML form for file upload."""
    return HTMLResponse(content="""
        <html>
            <body>
                <h1>Upload Syllabus</h1>
                <form action="/api/syllabus/upload" method="post" enctype="multipart/form-data">
                    <input type="file" name="file" accept=".pdf,.docx,.txt">
                    <button type="submit">Upload</button>
                </form>
            </body>
        </html>
    """)

@router.post("/upload", response_model=SyllabusAnalysisResponse)
async def upload_and_analyze_syllabus(
    file: UploadFile = File(..., description="Syllabus file (PDF, DOCX, TXT)"),
):
    """
    Upload a syllabus document (PDF, DOCX, TXT), extract text,
    and analyze it using the Groq API to identify topics,
    importance, and estimated study hours.
    """
    try:
        if not file:
            logger.error("No file uploaded")
            raise HTTPException(status_code=400, detail="No file uploaded.")

        logger.info(f"Received file: {file.filename}, Content-Type: {file.content_type}")

        # Validate file type
        allowed_content_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        ]
        
        if file.content_type not in allowed_content_types:
            logger.error(f"Invalid file type: {file.content_type}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: PDF, DOCX, TXT. Received: {file.content_type}"
            )

        # Extract text from uploaded file
        logger.info("Extracting text from file...")
        text_content = await extract_text_from_file(file)
        logger.info(f"Text extracted successfully (length: {len(text_content)} chars).")

        if not text_content.strip():
            logger.error("Extracted text is empty")
            raise HTTPException(status_code=400, detail="The uploaded file appears to be empty or contains no extractable text.")

        # Analyze syllabus using Groq API
        logger.info("Analyzing syllabus with Groq...")
        analysis_result = await analyze_syllabus(text_content)
        logger.info("Analysis complete.")

        return analysis_result

    except ValueError as ve:
        logger.error(f"Value Error during processing: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception(f"Unexpected error processing syllabus: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An unexpected error occurred processing the syllabus. Please try again or contact support if the issue persists.",
                "error": str(e)
            }
        )