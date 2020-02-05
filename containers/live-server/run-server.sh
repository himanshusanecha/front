#!/usr/bin/env bash

set -e

cd /var/www/Minds/front

npx ng run minds:server:production
npm run serve:ssr
