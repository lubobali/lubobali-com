"""What the page may send to the 3 doors (strict: unknown fields refused)."""

from __future__ import annotations

from typing import Annotated

from pydantic import UUID4, BaseModel, ConfigDict, Field, StringConstraints

from blueprint.schema import DataLocation, FollowUp, TeamSize


class _Req(BaseModel):
    model_config = ConfigDict(extra="forbid")


class StartRequest(_Req):
    visitor_id: UUID4
    story: Annotated[str, StringConstraints(strip_whitespace=True, min_length=20, max_length=1200)]
    data_location: DataLocation
    team_size: TeamSize
    website: str = Field(default="", max_length=200)  # honeypot: humans never see it
    elapsed_ms: int = Field(ge=0, le=86_400_000)  # time the form was open


class GenerateRequest(StartRequest):
    ticket: str = Field(max_length=600)
    followups: list[FollowUp] = Field(default_factory=list, max_length=3)


class BookRequest(_Req):
    blueprint: dict


class CopyRequest(_Req):
    blueprint: dict
    email: str = Field(max_length=254)
