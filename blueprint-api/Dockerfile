# Blueprint API (Phase 3b B4). Small, non-root, app code only.
# Built + run by scripts/blueprint-deploy.sh; secrets come from an env file
# on the server at run time, never baked into the image.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN useradd --uid 10001 --system --no-create-home --shell /usr/sbin/nologin app
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY blueprint ./blueprint

USER 10001
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/blueprint/health', timeout=4)"
# One worker: SQLite + the budget lock live in one process.
CMD ["python", "-m", "uvicorn", "--factory", "blueprint.api:app_from_env", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--no-server-header"]
