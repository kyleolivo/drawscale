#!/bin/bash
# Run dev server and capture output to log file, useful for review by claude
npm run dev 2>&1 | tee dev-server.log