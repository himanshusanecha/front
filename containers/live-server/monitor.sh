#!/usr/bin/env sh
set -e

cd /var/www/Minds/front
<<<<<<< HEAD
npx nodemon -L --delay 3 --watch dist --ignore dist/en --ext js,mjs  --exec "/usr/bin/env sh" /serve.sh
=======
npx nodemon --delay 3 --watch dist/server.js --watch dist/server --ext js,mjs  --exec "/usr/bin/env sh" /serve.sh
>>>>>>> 745769a53afa1c02ba6513b265ede87a162a0515
