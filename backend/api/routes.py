from fastapi import APIRouter, HTTPException
from models import TextAnalysisRequest, SentimentResponse
from services.llm_service import SentimentAnalyzer

router = APIRouter(prefix="/api", tags=["sentiment"])

analyzer = SentimentAnalyzer()

@router.post("/process_text", response_model=SentimentResponse)
async def process_text(request: TextAnalysisRequest):
    """
    Analyzes sentiment and extracts keywords from transcribed text.

    Args:
        request: TextAnalysisRequest containing the text to analyze
    
    Returns:
        SentimentResponse: sentiment score and keywords
    """
    try:
        result = analyzer.analyze(request.text)
        return result
    
    except Exception as e:
        print(f"Error in process_text endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze sentiment. Please try again."
        )