import os
from crewai import LLM
from dotenv import load_dotenv

#Execute the function to read .env file
load_dotenv()

#Initialize the chat model using crew ai
openrouter_model = LLM(
    model = "openrouter/google/gemini-2.5-flash",
    api_key = os.environ.get("OPENROUTER_API_KEY")
)