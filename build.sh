#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

mkdir -p out
node build/specs.js out/specs.json
node build/data.js out/specs.json out/data.json
cp static/* out/
