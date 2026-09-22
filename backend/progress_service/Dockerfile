FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

# Container-level health check (python is already in the image, curl is not).
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=4).status == 200 else 1)"

# --proxy-headers / --forwarded-allow-ips: this service only ever sits behind the nginx
# reverse proxy, so trust X-Forwarded-Proto/-For. Without it FastAPI believes every request is
# plain http and builds http:// redirect/absolute URLs, which browsers block on an https site.
# No --reload in production. Raise workers with WEB_CONCURRENCY only after adding DB migrations
# (several services run create_all() at import time).
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
