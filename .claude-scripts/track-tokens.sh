#!/bin/bash
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
echo "$DATE,$TIME,$1" >> ~/.claude-usage.csv 