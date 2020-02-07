#!/usr/bin/env sh
set -e

cd /var/www/Minds/front
npx nodemon -L --delay 3 --watch dist --ignore dist/en --ext js,mjs  --exec "/usr/bin/env sh" /serve.sh
