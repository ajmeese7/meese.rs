#!/usr/bin/env bash
set -euo pipefail

origin="$(git remote get-url origin 2>/dev/null || true)"
if [[ "${CODESPACES:-}" != "true" || "${GITHUB_REPOSITORY:-}" != "ajmeese7/meese-rs-authoring" || ! "$origin" =~ ^(https://github\.com/|git@github\.com:)ajmeese7/meese-rs-authoring(\.git)?$ ]]; then
  echo "Private editor startup is limited to the meese-rs-authoring Codespace."
  exit 0
fi

if curl --silent --output /dev/null http://localhost:4321/editor; then
  echo "Editor is already running on port 4321."
  exit 0
fi

key_dir="/workspaces/.meese-editor"
key_file="$key_dir/key"
umask 077
mkdir -p "$key_dir"
chmod 700 "$key_dir"
if [[ ! -f "$key_file" ]]; then
  node -e 'process.stdout.write(require("node:crypto").randomBytes(24).toString("hex") + "\n")' > "$key_file"
fi
chmod 600 "$key_file"
read -r MEESE_EDITOR_KEY < "$key_file"
if [[ ! "$MEESE_EDITOR_KEY" =~ ^[a-f0-9]{48}$ ]]; then
  echo "Editor key file is invalid: $key_file" >&2
  exit 1
fi
export MEESE_EDITOR_KEY

setsid -f nohup pnpm exec astro dev --host --force > /tmp/meese-editor.log 2>&1 < /dev/null
echo "Started private editor on port 4321. Keep its forwarded port private."
echo "Open the port URL and append the /editor?key=… path printed in /tmp/meese-editor.log."
