from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.services.groq_service import analyze_syllabus
from app.utils.file_processing import extract_text_from_file
from app.models.syllabus import SyllabusAnalysisResponse

router = APIRouter()

@router.post("/upload", response_model=SyllabusAnalysisResponse)
async def upload_and_analyze_syllabus(
    file: UploadFile = File(..., description="Syllabus file (PDF, DOCX, TXT)"),
):
    """
    Upload a syllabus document (PDF, DOCX, TXT), extract text,
    and analyze it using the Gemini API to identify topics,
    importance, and estimated study hours.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    print(f"Received file: {file.filename}, Content-Type: {file.content_type}")

    try:
        # Extract text from uploaded file
        print("Extracting text...")
        text_content = await extract_text_from_file(file)
        print(f"Text extracted successfully (length: {len(text_content)} chars).")

        # Analyze syllabus using Groq API
        print("Analyzing syllabus with Groq...")
        analysis_result = await analyze_syllabus(text_content)
        print("Analysis complete.")

        return analysis_result
    except ValueError as ve:
        # Handle errors from file processing or Gemini analysis (e.g., unsupported format, bad response)
        print(f"Value Error during processing: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException as he:
        # Re-raise HTTPExceptions directly
        raise he
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error processing syllabus: {e}")
        # Consider logging the full traceback here
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred processing the syllabus: {str(e)}")