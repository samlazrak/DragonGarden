#!/bin/bash
PROJECT=$1
sqlite3 ~/.claude-knowledge/db/claude-knowledge.db "SELECT context FROM contexts WHERE project='$PROJECT' ORDER BY created_at DESC LIMIT 1" 