"""The web layer of the Blueprint tool: routes, limits, plain messages (B3).

POST /api/blueprint/followups  story -> up to 3 questions + a signed ticket
POST /api/blueprint/generate   ticket + answers -> the blueprint (uses their one)
POST /api/blueprint/book       a signed blueprint -> kept 90 days + Calendly link
GET  /api/blueprint/health     {"ok": true}

The logic lives in service.py, settings in config.py, signing in
signing.py. Every refusal has a code + a plain message, and the page
always offers Book a call.

Run: uvicorn --factory blueprint.api:app_from_env
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import UTC, datetime

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from blueprint import llm
from blueprint.config import Settings
from blueprint.requests import BookRequest, GenerateRequest, StartRequest
from blueprint.service import RefusalError, Service

__all__ = ["Settings", "app_from_env", "create_app"]

MAX_BODY_BYTES = 16_384

MESSAGES = {
    "bad_input": "Please check your story: 20 to 1,200 characters, in your own words.",
    "too_big": "That's too long. Please keep your story under 1,200 characters.",
    "try_again": "Something went wrong on our side. Please try again in a minute, or book a free call.",
    "too_fast": "That was very fast. Take a moment to describe your problem, then try again.",
    "start_again": "Please start again from your story.",
    "slow_down": "That's a lot of tries for today. Please come back tomorrow, or just book a free call.",
    "busy": "The blueprint tool is very busy right now. Book a free call and we'll sketch it together.",
    "already_have": "You already have your blueprint. The next step is to talk it through: book a free call.",
    "ip_week": "You already have your blueprint. The next step is to talk it through: book a free call.",
}


def _refuse(status: int, code: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"code": code, "message": MESSAGES[code]})


def client_ip(request: Request, trusted_proxies: tuple[str, ...]) -> str:
    """The real visitor IP comes from nginx (X-Real-IP), trusted only when the
    request really comes from nginx's side of the network."""
    host = request.client.host if request.client else ""
    if host in trusted_proxies:
        return request.headers.get("x-real-ip", host)
    return host


async def limit_body(request: Request, call_next):
    """Refuse big bodies before reading them (nginx caps them too)."""
    size = request.headers.get("content-length")
    if size and size.isdigit() and int(size) > MAX_BODY_BYTES:
        return _refuse(413, "too_big")
    return await call_next(request)


def create_app(
    settings: Settings,
    *,
    ask: Callable = llm.ask,
    clock: Callable[[], datetime] = lambda: datetime.now(UTC),
) -> FastAPI:
    service = Service(settings, ask=ask, clock=clock)
    app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

    def ip_of(request: Request) -> str:
        return client_ip(request, settings.trusted_proxies)

    app.middleware("http")(limit_body)

    @app.exception_handler(RequestValidationError)
    async def bad_input(_request: Request, _exc: RequestValidationError):
        return _refuse(400, "bad_input")

    @app.exception_handler(RefusalError)
    async def refused(_request: Request, exc: RefusalError):
        return _refuse(exc.status, exc.code)

    @app.post("/api/blueprint/followups")
    def followups(r: StartRequest, request: Request):
        return service.followups(r, ip_of(request))

    @app.post("/api/blueprint/generate")
    def generate(r: GenerateRequest, request: Request):
        return service.generate(r, ip_of(request))

    @app.post("/api/blueprint/book")
    def book(r: BookRequest):
        return service.book(r)

    @app.get("/api/blueprint/health")
    def health():
        return {"ok": True}

    return app


def app_from_env() -> FastAPI:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    return create_app(Settings.from_env())
