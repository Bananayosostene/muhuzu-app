# MUHUZE backend: FastAPI served by uvicorn.
#
#   docker build -t muhuze-backend .
#   docker run --env-file .env -p 8000:8000 muhuze-backend
#
# Configuration comes from environment variables (see .env.example); no .env file is copied into the image.
# On start the container applies the database migrations, then serves the API on $PORT (8000 by default).

# ── Build: install the locked dependencies into a virtual environment ─────
FROM python:3.14-slim AS build

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Byte-compile for faster start-up; copy files instead of linking, since the cache is a separate mount.
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Dependencies first, so code changes reuse this layer.
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-install-project

COPY alembic.ini ./
COPY migrations ./migrations
COPY app ./app

# ── Run: only the environment and the code, as an unprivileged user ─────
FROM python:3.14-slim

RUN useradd --create-home --uid 10001 muhuze
WORKDIR /app
COPY --from=build --chown=muhuze:muhuze /app /app

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PORT=8000

USER muhuze
EXPOSE 8000

# Migrations are safe to repeat: Alembic applies only what the database does not have yet.
# --proxy-headers: hosting platforms put a proxy in front, and the client's real IP is recorded on sessions.
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port \"$PORT\" --proxy-headers --forwarded-allow-ips '*'"]
