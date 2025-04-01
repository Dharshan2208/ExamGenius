from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os

load_dotenv() # Load environment variables from .env file

class Settings(BaseSettings):
    # Define model_config using SettingsConfigDict for v2 compatibility
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    PROJECT_NAME: str = "ExamGenius API"
    API_V1_STR: str = "/api"

    GEMINI_API_KEY: str
    TAVILY_API_KEY: str

    # Optional: Add defaults or specific settings
    # DEFAULT_MODEL: str = "gemini-1.5-flash"

    # Add other settings as needed

settings = Settings()

# Example usage check:
# print(f"Gemini Key Loaded: {bool(settings.GEMINI_API_KEY)}")
# print(f"Tavily Key Loaded: {bool(settings.TAVILY_API_KEY)}")