#!/usr/bin/env sh
set -e

cd /var/www/Minds/front
npx nodemon --delay 3 --watch dist/en --ext js,css,jpg,png,svg,mp4,webp,webm  --exec "/usr/bin/env sh" /run-server.sh
