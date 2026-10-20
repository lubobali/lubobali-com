"""Settings of the Blueprint service, from the server environment (B3/B4).

Every limit is a setting, not code (Lubo: raise them when the tool brings
clients). Secrets (salt, signing key, AI key) come only from
/srv/lubobali-secrets/blueprint.env on the server.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from blueprint.store import Limits

CALENDLY = "https://calendly.com/data-lubobali/30min"


@dataclass(frozen=True)
class Settings:
    db_path: str
    salt: str
    signing_key: str
    limits: Limits = field(default_factory=Limits)
    min_fill_ms: int = 3000
    model_id: str | None = None
    # Worst-case price per million tokens (Opus 5.5 on OpenRouter, 2026-10).
    price_in_per_m: float = 4.0
    price_out_per_m: float = 20.0
    ticket_ttl_s: int = 3600
    calendly_url: str = CALENDLY
    trusted_proxies: tuple[str, ...] = ("127.0.0.1", "::1")

    @classmethod
    def from_env(cls) -> Settings:
        e = os.environ
        return cls(
            db_path=e.get("BLUEPRINT_DB", "/data/blueprint.sqlite"),
            salt=e["BLUEPRINT_SALT"],
            signing_key=e["BLUEPRINT_SIGNING_KEY"],
            limits=Limits(
                monthly_budget_usd=float(e.get("BLUEPRINT_MONTHLY_BUDGET_USD", 20)),
                daily_budget_usd=float(e.get("BLUEPRINT_DAILY_BUDGET_USD", 3)),
                blueprints_per_visitor=int(e.get("BLUEPRINT_PER_VISITOR", 1)),
                blueprints_per_ip_week=int(e.get("BLUEPRINT_PER_IP_WEEK", 1)),
                followups_per_ip_day=int(e.get("BLUEPRINT_FOLLOWUPS_PER_IP_DAY", 6)),
            ),
            model_id=e.get("BLUEPRINT_MODEL") or None,
            trusted_proxies=tuple(x for x in e.get("BLUEPRINT_TRUSTED_PROXIES", "127.0.0.1,::1").split(",") if x),
        )
