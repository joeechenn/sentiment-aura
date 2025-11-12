import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from typing import TypedDict, List

load_dotenv()

class SentimentResult(TypedDict):
    """
    Type definition for sentiment analysis results.
    """
    sentiment: float
    keywords: List[str]

class SentimentAnalyzer:
    """
    Service for analyzing sentiment and extracting keywords.
    """
    
    def __init__(self):
      """
      Initialize the OpenAI client.
      """
      self.client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
        )
      self.model="meta-llama/llama-3.3-8b-instruct:free"

    def analyze(self, text: str) -> SentimentResult:
      """
      Analyzes sentiment and extracts keywords from text.
      
      Args:
        text: The transcribed text to analyze
      
      Returns:
        SentimentResult: {"sentiment": float, "keywords": List[str]}
      """
      
      try:
        completion = self.client.chat.completions.create(
          model=self.model,
          messages=[
            {
              "role": "system",
              "content": """You are a sentiment analysis assistant. Analyze the given text and respond ONLY with valid JSON.
              IMPORTANT: You must extract BETWEEN 5-8 keywords (not just 3). Extract key emotional words, topics, and themes from the text.
              Respond in this exact format:
              {"sentiment": <float between -1 and 1>, "keywords": [<array of 5-8 descriptive words>]}
              Examples:
              - For "I'm so excited about this new project!": {"sentiment": 0.8, "keywords": ["excited", "new", "project", "enthusiastic", "positive"]}
              - For "This is terrible and frustrating": {"sentiment": -0.7, "keywords": ["terrible", "frustrating", "negative", "upset", "disappointed"]}
              No other text. Only JSON."""
            },
            {
              "role": "user",
              "content": f"Analyze this text: {text}"
            }])
        response_text = completion.choices[0].message.content
        result = json.loads(response_text)
        return result
        
      except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        return {"sentiment": 0.0, "keywords": ["neutral"]}

if __name__ == "__main__":
  analyzer = SentimentAnalyzer()
  test_result = analyzer.analyze("i am so excited about building this new project about analyzing sentiment and keywords from text!")
  print(f"Analysis result: {test_result}")
