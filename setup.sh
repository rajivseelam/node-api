#!/bin/bash
npm install nodemon -g
npm install forever -g
npm install gulp-cli -g
# need to look into pm2 in place of nodemon and forever
npm install
chmod u+x ./bin/start.sh
chmod u+x ./bin/stop.sh
chmod u+x ./bin/dev_start.sh