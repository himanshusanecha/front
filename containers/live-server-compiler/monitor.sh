#!/usr/bin/env sh
set -e

cd /var/www/Minds/front
npx nodemon -L --delay 3 --watch server.ts --watch dist --ignore dist/server/ --ignore dist/server.js --ext js,css,jpg,png,svg,mp4,webp,webm  --exec "/usr/bin/env sh" /build.sh
