import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Core backend configuration loader utilizing pydantic-settings.
    Resolves values from environmental properties and falling back to defaults.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-supabase-project.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "your-supabase-anon-key")
    
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Centralized prediction targets
    TARGET_MULTIPLIER_THRESHOLD: float = 1.50

settings = Settings()
