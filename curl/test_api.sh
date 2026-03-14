#!/usr/bin/env bash

BASE_URL="http://localhost:3000"

echo "== GET /injuries =="
curl -s -X GET "$BASE_URL/injuries" -H "Content-Type: application/json" | jq .
echo -e "\n"

echo "== POST /injuries/register =="
curl -s -X POST "$BASE_URL/injuries/register" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Ankle Sprain",
    "bodyPart": "ankle",
    "severity": "moderate",
    "includeVoice": false
  }' | jq .
echo -e "\n"

echo "== PUT /injuries/track =="
curl -s -X PUT "$BASE_URL/injuries/track" \
  -H "Content-Type: application/json" \
  -d '{
    "injuryId": 1,
    "isActive": false
  }' | jq .
echo -e "\n"

echo "== GET /learn =="
curl -s -X GET "$BASE_URL/learn" -H "Content-Type: application/json" | jq .
echo -e "\n"

echo "== POST /learn/ask =="
curl -s -X POST "$BASE_URL/learn/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "question": "How can I improve my vertical jump?",
    "includeVoice": false
  }' | jq .
echo -e "\n"

echo "== GET /diets/1 =="
curl -s -X GET "$BASE_URL/diets/1" -H "Content-Type: application/json" | jq .
echo -e "\n"

echo "== POST /diets/generate =="
curl -s -X POST "$BASE_URL/diets/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "question": "Design a recovery-focused diet rich in protein and micronutrients.",
    "includeVoice": false
  }' | jq .
echo -e "\n"
