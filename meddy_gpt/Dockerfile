### ---------- Base Stage ----------
    FROM python:3.11-slim AS base
    WORKDIR /app
    
    ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
    ENV HF_HOME=/app/.cache/huggingface
    ENV PYTHONPATH=/app
    
    # Avoid Python writing .pyc files to disk and buffering stdout
    ENV PYTHONDONTWRITEBYTECODE=1
    ENV PYTHONUNBUFFERED=1
    
    # Use for caching Docker layers
    COPY requirements-prod.txt .
    COPY requirements-dev.txt .
    
    ### ---------- Development Stage ----------
    FROM base AS development
    
    RUN pip install --no-cache-dir -r requirements-dev.txt
    
    COPY . .
    
    EXPOSE 8080
    CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
    
    
    ### ---------- Production Stage ----------
    FROM base AS production
    
    RUN pip install --no-cache-dir -r requirements-prod.txt
    
    COPY . .
    
    EXPOSE 8080
    CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
    