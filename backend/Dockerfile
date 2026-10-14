# MUHUZE backend: FastAPI served by uvicorn.
#
#   docker build -t muhuze-backend .
#   docker run --env-file .env -p 8000:8000 muhuze-backend
#
# Configuration comes from environment variables (see .env.example); no .env file is copied into the image.
# On start the container applies the database migrations, then serves the API on $PORT (8000 by default).
#
# Written for restricted builders and runtimes: it pulls only the official Python image, needs no BuildKit
# features, creates no user, and changes no file ownership.

# ── Build: install the locked dependencies into a virtual environment ─────
FROM python:3.14-slim AS build

# uv comes from PyPI, like any other package: some builders cannot copy files out of another image.
# Pinned to the version the lock file was made with.
RUN pip install --no-cache-dir uv==0.12.6

# Byte-compile for faster start-up; use this image's Python, never a downloaded one.
ENV UV_COMPILE_BYTECODE=1 \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Dependencies first, so code changes reuse this layer. --no-install-project installs only the
# dependencies: the app runs from its folder and is never built as a package.
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project --no-cache

COPY alembic.ini ./
COPY migrations ./migrations
COPY app ./app

# ── Run: only the environment and the code ─────
FROM python:3.14-slim

WORKDIR /app
COPY --from=build /app /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

EXPOSE 8000

# Both tools are started through the environment's own Python by full path, so nothing depends on
# PATH or on the tools' launcher scripts being found.
# Migrations are safe to repeat: Alembic applies only what the database does not have yet.
# --proxy-headers: hosting platforms put a proxy in front, and the client's real IP is recorded on sessions.
CMD ["sh", "-c", "/app/.venv/bin/python -m alembic upgrade head && exec /app/.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port \"$PORT\" --proxy-headers --forwarded-allow-ips '*'"]
