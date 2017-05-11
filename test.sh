#!/bin/bash
echo Run unit tests in Chrome
echo \(You may need to run gulp and npm install express gulp-qunit before testing.\)
echo
sh test-in-chrome.sh &
node qunit/server.js
