## AthleteAssist API - cURL Examples

All responses are JSON.

### Authentication

**Register a new user**

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Athlete",
    "email": "john@example.com",
    "username": "johnathlete",
    "password": "password123",
    "age": 21,
    "height": 180,
    "weight": 75,
    "sport": "basketball",
    "levelOfProficiencyInSports": "intermediate",
    "injuryHistory": "Minor ankle sprain last season"
  }'
```

**Login user**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johnathlete",
    "password": "password123"
  }'
```

**Get user profile (requires authentication token)**

```bash
# First get the token from login response
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### Injuries

**Get basic basketball injuries**

```bash
curl -X GET http://localhost:3000/injuries \
  -H "Content-Type: application/json"
```

**Register a new injury (with optional voice)**

```bash
curl -X POST http://localhost:3000/injuries/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Ankle Sprain",
    "bodyPart": "ankle",
    "severity": "moderate",
    "includeVoice": true
  }'
```

**Track injury (update isActive)**

```bash
curl -X PUT http://localhost:3000/injuries/track \
  -H "Content-Type: application/json" \
  -d '{
    "injuryId": 1,
    "isActive": false
  }'
```

### Learn

**Get learn content**

```bash
curl -X GET http://localhost:3000/learn \
  -H "Content-Type: application/json"
```

**Ask learning question (with voice) - requires authentication**

```bash
# First get the token from login response
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/learn/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": 1,
    "question": "How can I improve my free throw accuracy?",
    "includeVoice": true
  }'
```

### Diets

**Get existing or lazy-generate diet for user - requires authentication**

```bash
# First get the token from login response
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/diets/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

**Generate new diet using RAG pipeline - requires authentication**

```bash
# First get the token from login response
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/diets/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": 1,
    "question": "Create a high-protein balanced diet to support recovery from knee injury.",
    "includeVoice": false
  }'
```

### Exercises

**Get all exercises**

```bash
curl -X GET http://localhost:3000/exercises \
  -H "Content-Type: application/json"
```

**Get specific exercise**

```bash
curl -X GET http://localhost:3000/exercises/1 \
  -H "Content-Type: application/json"
```

### Rules

**Get all basketball rules**

```bash
curl -X GET http://localhost:3000/rules \
  -H "Content-Type: application/json"
```

### Warmups

**Get all warmups**

```bash
curl -X GET http://localhost:3000/warmups \
  -H "Content-Type: application/json"
```

### Voice AI

**Process voice queries with AI responses**

```bash
curl -X POST http://localhost:3000/voice-ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "How can I improve my basketball shooting technique?",
    "includeVoice": true
  }'
```

### Health Check

**Check API health**

```bash
curl -X GET http://localhost:3000/health \
  -H "Content-Type: application/json"
```

## Notes

- **Authentication**: Most endpoints that work with user data require authentication. Include the JWT token in the `Authorization: Bearer <token>` header.
- **Voice Features**: Some endpoints support `includeVoice: true` to return audio responses (base64 encoded).
- **Error Handling**: All endpoints return appropriate HTTP status codes and JSON error messages.
- **Base URL**: All examples use `http://localhost:3000` as the base URL.
***
