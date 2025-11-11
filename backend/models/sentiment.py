from pydantic import BaseModel, Field
from typing import List

class TextAnalysisRequest(BaseModel):
    """
    Request model for text analysis endpoint
    """
    text: str = Field(..., min_length=1, description="The text to analyze for sentiment")

class SentimentResponse(BaseModel):
    """
    Response model containing sentiment analysis results
    """
    sentiment: float = Field(..., ge=-1.0, le=1.0, description="Sentiment score between -1 (negative) and 1 (positive)")
    keywords: List[str] = Field(..., min_items=1, description="List of emotional keywords extracted from text")