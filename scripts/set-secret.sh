#!/usr/bin/env bash
# Put a secret into a server env file without it ever showing on screen,
# in chat or in shell history (Phase 3b B9.6: two secrets leaked by being
# pasted into a chat). Hidden typing; the file keeps its owner + mode.
#   scripts/set-secret.sh OPENROUTER_API_KEY                    (blueprint.env)
#   scripts/set-secret.sh SMTP_PASSWORD /srv/lubot-publisher/.env
set -euo pipefail

NAME=${1:?usage: set-secret.sh NAME [env-file]}
FILE=${2:-/srv/lubobali-secrets/blueprint.env}
[[ $NAME =~ ^[A-Z][A-Z0-9_]*$ ]] || { echo "set-secret: bad name: $NAME" >&2; exit 1; }
[[ -f $FILE ]] || { echo "set-secret: no such file: $FILE" >&2; exit 1; }
grep -q "^$NAME=" "$FILE" || { echo "set-secret: $NAME is not in $FILE" >&2; exit 1; }

read -rsp "New value for $NAME (hidden): " VALUE; echo
read -rsp "Again (hidden): " AGAIN; echo
[[ -n $VALUE ]] || { echo "set-secret: empty, nothing changed" >&2; exit 1; }
[[ $VALUE == "$AGAIN" ]] || { echo "set-secret: the two don't match, nothing changed" >&2; exit 1; }
[[ $VALUE != *$'\n'* ]] || { echo "set-secret: no new lines allowed" >&2; exit 1; }

cp -p "$FILE" "$FILE.bak.$(date +%Y%m%d-%H%M%S)"   # same owner + mode
TMP=$(mktemp "$FILE.XXXXXX")
chmod --reference="$FILE" "$TMP"; chown --reference="$FILE" "$TMP"
# awk reads the value from the environment: never on a command line.
NAME=$NAME VALUE=$VALUE awk 'BEGIN { n = ENVIRON["NAME"] "=" }
  index($0, n) == 1 { print n ENVIRON["VALUE"]; next } { print }' "$FILE" > "$TMP"
mv "$TMP" "$FILE"
echo "set-secret: $NAME updated in $FILE (old file kept as .bak)."
