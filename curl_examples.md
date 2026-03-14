## AthleteAssist API - cURL Examples

All responses are JSON.

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

**Ask learning question (with voice)**

```bash
curl -X POST http://localhost:3000/learn/ask \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "question": "How can I improve my free throw accuracy?",
    "includeVoice": true
  }'
```

### Diets

**Get existing or lazy-generate diet for user**

```bash
curl -X GET http://localhost:3000/diets/1 \
  -H "Content-Type: application/json"
```

**Generate new diet using RAG pipeline**

```bash
curl -X POST http://localhost:3000/diets/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "question": "Create a high-protein balanced diet to support recovery from knee injury.",
    "includeVoice": false
  }'
```
***
 End Patch***ည္ 综合色assistant to=functions.ApplyPatchൃതദassistantatsira to=functions.ApplyPatch.SerializedNamenumerusform.UNRELATED to=functions.ApplyPatch젝 to=functions.ApplyPatch ***!
