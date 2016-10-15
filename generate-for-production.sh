#!/bin/bash

rm -r build
node set-config-to-production.js
node generate.js
gulp build-for-production