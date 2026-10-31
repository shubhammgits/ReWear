#!/usr/bin/env bash
# Generates one runnable audit file per config: qa/runs/<phase>-<name>.js
# Usage: bash qa/make-runs.sh before|after
set -euo pipefail
cd "$(dirname "$0")"
phase="${1:-before}"
mkdir -p runs

# name|engine|device|width|height
configs=(
  "webkit-iphone14-390x844|webkit|iPhone 14|390|844"
  "webkit-iphone15pro-430x932|webkit|iPhone 15 Pro|430|932"
  "webkit-iphone14-landscape-844x390|webkit|iPhone 14 landscape|844|390"
  "chromium-360x740|chromium||360|740"
  "chromium-768x1024|chromium||768|1024"
  "chromium-1024x768|chromium||1024|768"
  "chromium-1440x900|chromium||1440|900"
  "chromium-1920x1080|chromium||1920|1080"
)

for c in "${configs[@]}"; do
  IFS="|" read -r name engine device w h <<<"$c"
  mkdir -p "$phase/$name"
  dev=$([ -n "$device" ] && echo "\"$device\"" || echo "null")
  json="{ name: \"$name\", phase: \"$phase\", engine: \"$engine\", device: $dev, w: $w, h: $h }"
  sed "s|__CONFIG__|$json|" audit.template.js >"runs/$phase-$name.js"
done
ls runs
