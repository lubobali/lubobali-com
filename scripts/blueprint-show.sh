#!/usr/bin/env bash
# Read a booked AI blueprint before the call (Phase 3b B5.3).
#   scripts/blueprint-show.sh K7M2QX     the blueprint with that code
#   scripts/blueprint-show.sh --list     codes booked in the last 90 days
# The code is in the Calendly booking (UTM content). Server only.
set -euo pipefail
exec docker exec lubobali-blueprint-staging python -m blueprint.show "${1:---list}"
