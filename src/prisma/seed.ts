import dotenv from "dotenv";
import { PrismaClient, WarmupType } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Athlete",
      email: "john@example.com",
      age: 21,
      height: 180,
      weight: 75,
      sport: "basketball",
      levelOfProficiencyInSports: "intermediate",
      injuryHistory: "Minor ankle sprain last season"
    }
  });

  console.log("Demo user:", user);

  const basketballRules = [
    {
      title: "Dribbling Rules",
      description: "Players must dribble while moving. Double dribble and traveling are violations."
    },
    {
      title: "Scoring Rules",
      description: "Field goals are worth 2 or 3 points, free throws are worth 1 point."
    },
    {
      title: "Foul Rules",
      description:
        "Personal fouls, shooting fouls, and technical fouls result in free throws or possession changes."
    }
  ];

  await prisma.rule.deleteMany();
  await prisma.rule.createMany({
    data: basketballRules.map((rule, index) => ({
      sport: "basketball",
      title: `Rule #${index + 1}: ${rule.title}`,
      description: rule.description
    }))
  });

  const basketballExercises = [
    {
      name: "Ankle Mobility Circles",
      sports: ["basketball"],
      bodyPart: "ankle",
      description: "Slow ankle circles to improve mobility and reduce sprain risk."
    },
    {
      name: "Bodyweight Squats",
      sports: ["basketball"],
      bodyPart: "legs",
      description: "Basic squats focusing on knee alignment to build lower-body strength."
    },
    {
      name: "Core Plank Hold",
      sports: ["basketball"],
      bodyPart: "core",
      description: "Static plank position to build core stability for better balance."
    }
  ];

  await prisma.exercise.deleteMany();
  for (const ex of basketballExercises) {
    await prisma.exercise.create({
      data: ex
    });
  }

  const basketballWarmups = [
    {
      name: "Dynamic High Knees",
      sports: ["basketball"],
      type: WarmupType.PRE,
      description: "Jog in place with high knees to elevate heart rate and warm up legs."
    },
    {
      name: "Layup Lines Cooldown",
      sports: ["basketball"],
      type: WarmupType.POST,
      description: "Low-intensity layups and light shooting to gradually lower heart rate."
    },
    {
      name: "Lateral Shuffle",
      sports: ["basketball"],
      type: WarmupType.PRE,
      description: "Side-to-side shuffles to prepare for defensive slides."
    }
  ];

  await prisma.warmup.deleteMany();
  for (const w of basketballWarmups) {
    await prisma.warmup.create({
      data: w
    });
  }

  const basketballLearnContent = [
    {
      topic: "Basic Rules of Basketball",
      content:
        "Basketball is played between two teams of five players. The goal is to score by shooting the ball through the opponent's hoop."
    },
    {
      topic: "Shooting Fundamentals",
      content:
        "Focus on balance, elbow alignment, follow-through, and consistent shot mechanics to improve accuracy."
    },
    {
      topic: "Injury Prevention",
      content:
        "Proper warmup, strength training, and landing mechanics help reduce ankle and knee injuries."
    }
  ];

  await prisma.learnContent.deleteMany();
  for (const lc of basketballLearnContent) {
    await prisma.learnContent.create({
      data: {
        sport: "basketball",
        topic: lc.topic,
        content: lc.content
      }
    });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

