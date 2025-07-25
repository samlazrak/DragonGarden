#!/bin/bash
# Save context and track usage
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
echo "$DATE,$TIME,$1" >> ~/.claude-knowledge/db/usage.csv
echo "Context saved and usage tracked."
