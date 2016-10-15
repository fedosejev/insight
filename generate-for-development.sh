#!/bin/bash

rm -r build
node set-config-to-development.js
node generate.js
gulp build-for-development