FROM python:3.11-slim

# Install system dependencies for PostgreSQL client
RUN apt-get update && apt-get install -y \
    libpq-dev \
    curl git \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH
ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app

# Copy application code
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Run database initialization then start the server
CMD ["sh", "-c", "uv run init_db.py && uv run uvicorn main:app --host 0.0.0.0 --port 8000"]
