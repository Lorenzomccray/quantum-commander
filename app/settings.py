from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Provider selector: openai | anthropic | groq
    MODEL_PROVIDER: str = Field(default="openai")

    # Model names (override in .env if you like)
    OPENAI_MODEL: str = Field(default="gpt-4o-mini")
    ANTHROPIC_MODEL: str = Field(default="claude-3-5-sonnet-latest")
    GROQ_MODEL: str = Field(default="llama-3.1-70b-versatile")

    # API keys (optional depending on provider you use)
    OPENAI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    GROQ_API_KEY: str | None = None

    # Tools & data
    TAVILY_API_KEY: str | None = None

    # Supabase
    SUPABASE_URL: str | None = None
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None

    # Pydantic v2 settings config
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


settings = Settings()

