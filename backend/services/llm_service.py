import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENROUTER_API_KEY"),
)

def analyze_sentiment(text: str) -> dict:
  """
  Analyzes sentiment and extracts keywords from text.

  Args:
    text (string): transcribed text to analyze
  Returns:
    dict: {"sentiment: float, "keywords": list}
  """

  try:
    completion = client.chat.completions.create(
      model="meta-llama/llama-3.3-8b-instruct:free",
      messages=[
        {
          "role": "system",
          "content": "You're a sentiment analysis assistant. Analyze the given text and only with valid JSON in this exact format: {\"sentiment\": <float between -1 and 1>, \"keywords\": [<list of 3-8 key emotional words>]}. No other text."
        },
        {
          "role": "user",
          "content": f"Analyze this text: {text}"
        }])
        
    response_text = completion.choices[0].message.content
    print(f"Raw LLM response: {response_text}")
        
    result = json.loads(response_text)
    return result
  
  except Exception as e:
    print(f"Error analyzing text: {e}")
    return {"sentiment": 0.0, "keywords": ["neutral"]}
  
if __name__ == "__main__":
    test_result = analyze_sentiment("i am so excited to building this new project about analyzing sentiment and keywords from text!")
    print(test_result)
