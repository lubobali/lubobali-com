# Blueprint API (Phase 3b)

Small Python service behind the "AI Project Blueprint" tool on the home
page. A visitor describes their problem; they get a first plan in Lubo's
way (why → old flow → players → users → new flow), then book a call.

Rule: **the AI writes, the code checks.** The model only returns text in a
strict shape (`blueprint/schema.py`); every number the visitor sees (data
readiness, timeline, time saved) is computed by `blueprint/rules.py`.
The "how" (tools, architecture, fixes, cost) is never generated: it stays
for the call (`blueprint/patterns.py` → `LOCKED`).

| File | What |
|---|---|
| `blueprint/schema.py` | What the visitor sends + the strict shape the AI must return |
| `blueprint/rules.py` | Readiness score, 2-week timeline, time saved (pure, tested) |
| `blueprint/patterns.py` | The 4 kinds of projects Lubo builds (= the home page cards) |

No secrets here, ever: the AI key lives only on the server (Phase 3b B4).

```sh
pip install -r requirements.txt
python -m pytest          # tests + doctests
ruff check . && ruff format --check .
```
