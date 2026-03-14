import { User, Injury, Exercise, Warmup, Rule, LearnContent } from "@prisma/client";

export interface DietPromptContext {
  user: User;
  injuries: Injury[];
}

export interface RagDietContext {
  user: User;
  injuries: Injury[];
  exercises: Exercise[];
  warmups: Warmup[];
  rules: Rule[];
  learnContent: LearnContent[];
}

export const buildDietPrompt = (context: DietPromptContext): string => {
  const { user, injuries } = context;

  const injuriesList =
    injuries.length === 0
      ? "None"
      : injuries
          .map(
            (i, idx) => `${idx + 1}. ${i.name} (${i.bodyPart}) - severity: ${i.severity}`
          )
          .join("\n");

  return `
You are a professional sports nutritionist.

Athlete details:
- Name: ${user.name}
- Age: ${user.age}
- Height: ${user.height} cm
- Weight: ${user.weight} kg
- Sport: ${user.sport}
- Level of proficiency: ${user.levelOfProficiencyInSports}

Injuries:
${injuriesList}

Task:
Generate a daily diet plan optimized for a basketball athlete, considering injury recovery and performance.

Output JSON ONLY with this exact structure:

{
  "summary": "Short natural language summary of the diet goals.",
  "macros": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fats_g": number
  },
  "micronutrients": {
    "vitamin_d_iu": number,
    "calcium_mg": number,
    "iron_mg": number,
    "magnesium_mg": number,
    "other": string
  },
  "hydration": {
    "water_liters": number,
    "electrolytes": string
  },
  "meals": {
    "breakfast": {
      "description": string,
      "protein_g": number,
      "carbs_g": number,
      "fats_g": number
    },
    "lunch": {
      "description": string,
      "protein_g": number,
      "carbs_g": number,
      "fats_g": number
    },
    "snack": {
      "description": string,
      "protein_g": number,
      "carbs_g": number,
      "fats_g": number
    },
    "dinner": {
      "description": string,
      "protein_g": number,
      "carbs_g": number,
      "fats_g": number
    }
  }
}

Return valid JSON only.
`.trim();
};

export const buildInjuryAdvicePrompt = (injuryName: string, bodyPart: string): string => {
  return `
You are a professional sports physiotherapist.

Provide guidance for the following basketball-related injury:

Injury name: ${injuryName}
Body part: ${bodyPart}

Explain in concise bullet points.

Return JSON ONLY with this structure:

{
  "precaution": "List of precautions as a short paragraph or bullet-like text.",
  "recovery": "Recovery tips, rehab guidelines, and when to see a doctor.",
  "cure": "High-level treatment overview and long-term management."
}

Do not include any markdown, comments, or explanations. JSON only.
`.trim();
};

export const buildLearnPrompt = (
  userName: string,
  question: string,
  context: string
): string => {
  return `
You are a professional basketball coach and sports educator.

Athlete name: ${userName}

Context knowledge base (array-style):
${context}

The athlete asked:
"${question}"

Task:
1. Recommend a specific YouTube video search query or direct video suggestion.
2. Provide care tips.
3. Provide precautions.

Return JSON ONLY with this structure:

{
  "recommendedYoutubeQuery": "A concrete YouTube search query or video title/URL suggestion.",
  "careTips": "Short paragraph of practical care tips.",
  "precautions": "Short paragraph of precautions and warnings."
}
`.trim();
};

export const buildRagDietPrompt = (ragContext: RagDietContext, question: string): string => {
  const { user, injuries, exercises, warmups, rules, learnContent } = ragContext;

  const injuryText =
    injuries.length === 0
      ? "No current injuries."
      : injuries
          .map(
            (i, idx) =>
              `Injury[${idx + 1}]: ${i.name} on ${i.bodyPart}, severity=${i.severity}, active=${i.isActive}`
          )
          .join("\n");

  const rulesText = rules
    .map((r, idx) => `Rule[${idx + 1}] (${r.sport}): ${r.title} -> ${r.description}`)
    .join("\n");

  const exerciseText = exercises
    .map(
      (e, idx) =>
        `Exercise[${idx + 1}] sports=${e.sports.join(
          ","
        )}, bodyPart=${e.bodyPart}, name=${e.name} -> ${e.description}`
    )
    .join("\n");

  const warmupText = warmups
    .map(
      (w, idx) =>
        `Warmup[${idx + 1}] sports=${w.sports.join(
          ","
        )}, type=${w.type}, name=${w.name} -> ${w.description}`
    )
    .join("\n");

  const learnText = learnContent
    .map((l, idx) => `Learn[${idx + 1}] sport=${l.sport}, topic=${l.topic} -> ${l.content}`)
    .join("\n");

  return `
You are a professional sports nutritionist specializing in basketball athletes.

Athlete profile:
- Name: ${user.name}
- Age: ${user.age}
- Height: ${user.height} cm
- Weight: ${user.weight} kg
- Sport: ${user.sport}
- Skill level: ${user.levelOfProficiencyInSports}

Injury context (array-style):
${injuryText}

Basketball rules (array-style):
${rulesText}

Exercises (array-style):
${exerciseText}

Warmups (array-style):
${warmupText}

Learning content (array-style):
${learnText}

User question:
"${question}"

Task:
Using the above context (RAG-style knowledge), generate a personalized, recovery-aware diet plan.

Return JSON ONLY with the SAME structure as before:

{
  "summary": string,
  "macros": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fats_g": number
  },
  "micronutrients": {
    "vitamin_d_iu": number,
    "calcium_mg": number,
    "iron_mg": number,
    "magnesium_mg": number,
    "other": string
  },
  "hydration": {
    "water_liters": number,
    "electrolytes": string
  },
  "meals": {
    "breakfast": {
      "description": string,
      "protein_g": number,
      "carbs_g": number,
      "fats_g": number
    },
    "lunch": {
      "description": string,
      "protein_g": number,
      "carbs_g": number,
      "fats_g": number
    },
    "snack": {
      "description": string,
      "protein_g": number,
      "carbs_g": number,
      "fats_g": number
    },
    "dinner": {
      "description": string,
      "protein_g": number,
      "carbs_g": number,
      "fats_g": number
    }
  }
}

Return valid JSON only.
`.trim();
};

