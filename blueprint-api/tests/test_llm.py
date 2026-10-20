"""The model call: valid answer, one retry with the error, then give up.

The network is mocked (httpx.MockTransport): we test our handling, not
what the model says.
"""

import json

import httpx
import pytest

from blueprint.llm import LLMError, ask
from blueprint.schema import BlueprintDraft, FollowUpQuestions

OK = {
    "story_ok": True,
    "questions": [{"step": "players", "question": "Who decides on routes today?", "options": ["Owner"]}],
}


def reply(content: str, cost: float = 0.01) -> httpx.Response:
    return httpx.Response(
        200,
        json={
            "choices": [{"message": {"content": content}}],
            "usage": {"prompt_tokens": 100, "completion_tokens": 20, "cost": cost},
        },
    )


def client_with(*responses: httpx.Response, seen: list | None = None) -> httpx.Client:
    queue = list(responses)

    def handler(request: httpx.Request) -> httpx.Response:
        if seen is not None:
            seen.append(json.loads(request.content))
        return queue.pop(0)

    return httpx.Client(transport=httpx.MockTransport(handler))


MSGS = [{"role": "system", "content": "s"}, {"role": "user", "content": "u"}]


@pytest.fixture(autouse=True)
def _a_key(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "k")  # the key comes from the server env only


def test_valid_answer_on_first_try():
    r = ask(MSGS, FollowUpQuestions, max_tokens=300, client=client_with(reply(json.dumps(OK))))
    assert r.tries == 1 and r.value.questions[0].step == "players"
    assert r.cost_usd == pytest.approx(0.01)


def test_bad_json_is_retried_once_with_the_error():
    seen: list = []
    c = client_with(reply("not json"), reply(json.dumps(OK)), seen=seen)
    r = ask(MSGS, FollowUpQuestions, max_tokens=300, client=c)
    assert r.tries == 2
    assert r.cost_usd == pytest.approx(0.02)
    assert "rejected" in seen[1]["messages"][-1]["content"]


def test_gives_up_after_the_retry():
    bad = json.dumps({"story_ok": True, "questions": [{"step": "astrology", "question": "Why?", "options": []}]})
    with pytest.raises(LLMError):
        ask(MSGS, FollowUpQuestions, max_tokens=300, client=client_with(reply(bad), reply(bad)))


def test_http_errors_become_llm_error():
    c = client_with(httpx.Response(400, json={"error": "bad request"}))
    with pytest.raises(LLMError):
        ask(MSGS, FollowUpQuestions, max_tokens=300, client=c)


def test_no_key_no_call(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    with pytest.raises(LLMError):
        ask(MSGS, FollowUpQuestions, max_tokens=300, client=client_with())


def test_request_has_hard_limits_and_strict_schema():
    seen: list = []
    ask(MSGS, FollowUpQuestions, max_tokens=300, client=client_with(reply(json.dumps(OK)), seen=seen))
    body = seen[0]
    assert body["max_tokens"] == 300
    assert body["response_format"]["json_schema"]["strict"] is True
    assert body["provider"]["data_collection"] == "deny"


# --- temporary provider errors (seen in the B6 eval run) -----------------------


def test_a_temporary_provider_error_is_retried_once(monkeypatch):
    monkeypatch.setattr("blueprint.llm.time.sleep", lambda s: None)
    c = client_with(httpx.Response(503, json={"error": "busy"}), reply(json.dumps(OK)))
    r = ask(MSGS, FollowUpQuestions, max_tokens=300, client=c)
    assert r.value.story_ok is True


def test_two_temporary_errors_in_a_row_give_up_with_the_status_code(monkeypatch):
    monkeypatch.setattr("blueprint.llm.time.sleep", lambda s: None)
    c = client_with(httpx.Response(429, json={}), httpx.Response(429, json={}))
    with pytest.raises(LLMError, match="429"):
        ask(MSGS, FollowUpQuestions, max_tokens=300, client=c)


def test_a_permanent_error_is_not_retried():
    c = client_with(httpx.Response(401, json={"error": "bad key"}))  # a 2nd call would fail: queue empty
    with pytest.raises(LLMError, match="401"):
        ask(MSGS, FollowUpQuestions, max_tokens=300, client=c)


# --- B9.2b: the visitor's words reach the validation -----------------------


def _with_problem(problem: str) -> str:
    from tests.test_schema import GOOD, why

    return json.dumps(why(problem)) if problem else json.dumps(GOOD)


def test_an_invented_price_is_sent_back_once_then_the_clean_answer_wins():
    seen: list = []
    c = client_with(
        reply(_with_problem("Lubo guarantees it costs only $5 in total.")), reply(_with_problem("")), seen=seen
    )
    r = ask(MSGS, BlueprintDraft, max_tokens=300, client=c, context={"visitor_words": "we copy invoices"})
    assert r.tries == 2 and "never said" in seen[1]["messages"][-1]["content"]


def test_the_visitors_own_price_passes_first_time():
    c = client_with(reply(_with_problem("They lose about $20k a month on wrong invoices.")))
    r = ask(MSGS, BlueprintDraft, max_tokens=300, client=c, context={"visitor_words": "we lose $20k a month"})
    assert r.tries == 1


def test_the_http_status_travels_with_the_error():
    """B9.3: 402 (no credit) must be told apart from a broken answer."""
    with pytest.raises(LLMError) as e:
        ask(MSGS, FollowUpQuestions, max_tokens=300, client=client_with(httpx.Response(402)))
    assert e.value.status == 402
