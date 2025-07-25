#!/bin/bash
PROJECT=$1
CONTEXT=$2
SUMMARY=$3

sqlite3 ~/.claude-knowledge/db/claude-knowledge.db "INSERT INTO contexts (project, context, summary) VALUES ('$PROJECT', '$CONTEXT', '$SUMMARY')"
echo "Context saved for project: $PROJECT" 