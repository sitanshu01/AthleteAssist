import "dotenv/config";
import { PrismaClient, WarmupType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter }).$extends(withAccelerate());

async function main() {
  console.log("Seeding database...");

  const hashedPassword1 = await bcrypt.hash("password123", 10);
  const hashedPassword2 = await bcrypt.hash("password456", 10);

  const user = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Athlete",
      email: "john@example.com",
      username: "johnathlete",
      password: hashedPassword1,
      age: 21,
      height: 180,
      weight: 75,
      sport: "basketball",
      levelOfProficiencyInSports: "intermediate",
      injuryHistory: "Minor ankle sprain last season",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      name: "Jane Athlete",
      email: "jane@example.com",
      username: "janeathlete",
      password: hashedPassword2,
      age: 24,
      height: 165,
      weight: 60,
      sport: "basketball",
      levelOfProficiencyInSports: "advanced",
      injuryHistory: "No major injuries",
    },
  });

  console.log("Demo users created:", { user, user2 });

  const basketballRules = [
    {
      title: "Dribbling Rules",
      description:
        "Players must dribble while moving. Double dribble and traveling are violations.",
    },
    {
      title: "Scoring Rules",
      description:
        "Field goals are worth 2 or 3 points, free throws are worth 1 point.",
    },
    {
      title: "Foul Rules",
      description:
        "Personal fouls, shooting fouls, and technical fouls result in free throws or possession changes.",
    },
    {
      title: "Out of Bounds",
      description:
        "The ball is out of play when it touches a boundary line or any object out of bounds.",
    },
    {
      title: "Shot Clock",
      description:
        "Teams must attempt a shot that hits the rim within the shot clock period.",
    },
    {
      title: "Backcourt Violation",
      description:
        "Once the offense advances the ball to the frontcourt, they cannot return to the backcourt with possession.",
    },
    {
      title: "Three-Second Rule",
      description:
        "Offensive players cannot remain in the key (paint) for more than three consecutive seconds while their team controls the ball.",
    },
    {
      title: "Eight-Second Rule",
      description:
        "The offense must move the ball past half court within eight seconds.",
    },
    {
      title: "Goaltending",
      description:
        "Interfering with the ball on its downward flight toward the basket or after it has touched the backboard is not allowed.",
    },
    {
      title: "Traveling",
      description:
        "Taking more than two steps without dribbling or changing pivot foot illegally results in a traveling violation.",
    },
  ];

  await prisma.rule.deleteMany();
  await prisma.rule.createMany({
    data: basketballRules.map((rule, index) => ({
      sport: "basketball",
      title: `Rule #${index + 1}: ${rule.title}`,
      description: rule.description,
    })),
  });

  console.log("Rules seeded.");

  const basketballExercises = [
    {
      name: "Ankle Mobility Circles",
      sports: ["basketball"],
      bodyPart: "ankle",
      description: "Slow ankle circles to improve mobility and reduce sprain risk.",
      ytLink: "https://www.youtube.com/watch?v=LFO2dGI-gxo",
    },
    {
      name: "Bodyweight Squats",
      sports: ["basketball"],
      bodyPart: "legs",
      description:
        "Basic squats focusing on knee alignment to build lower-body strength.",
      ytLink: "https://www.youtube.com/watch?v=aclHkVaku9U",
    },
    {
      name: "Core Plank Hold",
      sports: ["basketball"],
      bodyPart: "core",
      description:
        "Static plank position to build core stability for better balance.",
      ytLink: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    },
    {
      name: "Glute Bridge",
      sports: ["basketball"],
      bodyPart: "hips",
      description:
        "Glute bridges to strengthen posterior chain and support explosive movements.",
      ytLink: "https://www.youtube.com/watch?v=m2Zx-57cSok",
    },
    {
      name: "Calf Raises",
      sports: ["basketball"],
      bodyPart: "calves",
      description: "Standing calf raises for ankle stability and jumping power.",
      ytLink: "https://www.youtube.com/watch?v=YMmgqO8Jo-k",
    },
    {
      name: "Single-Leg Balance",
      sports: ["basketball"],
      bodyPart: "ankle",
      description: "Single-leg balance drill to improve ankle proprioception.",
      ytLink: "https://www.youtube.com/watch?v=qFfGkqN-5VY",
    },
    {
      name: "Lunges",
      sports: ["basketball"],
      bodyPart: "legs",
      description:
        "Forward lunges to strengthen quads and glutes while training stability.",
      ytLink: "https://www.youtube.com/watch?v=QFVVmcgR6_Y",
    },
    {
      name: "Wall Sits",
      sports: ["basketball"],
      bodyPart: "legs",
      description: "Isometric wall sits to build leg endurance for defense.",
      ytLink: "https://www.youtube.com/watch?v=y-wV4Venusw",
    },
    {
      name: "Hip Flexor Stretch",
      sports: ["basketball"],
      bodyPart: "hips",
      description:
        "Stretching hip flexors to improve stride length and reduce tightness.",
      ytLink: "https://www.youtube.com/watch?v=7fWj5hQ5Qq0",
    },
    {
      name: "Resistance Band Lateral Walks",
      sports: ["basketball"],
      bodyPart: "hips",
      description:
        "Lateral walks with band for glute med activation and lateral stability.",
      ytLink: "https://www.youtube.com/watch?v=9z5C-Arn7vE",
    },
  ];

  await prisma.exercise.deleteMany();
  for (const ex of basketballExercises) {
    await prisma.exercise.create({ data: ex });
  }

  console.log("Exercises seeded.");

  const basketballWarmups = [
    {
      name: "Dynamic High Knees",
      sports: ["basketball"],
      type: WarmupType.PRE,
      description:
        "Jog in place with high knees to elevate heart rate and warm up legs.",
    },
    {
      name: "Layup Lines Cooldown",
      sports: ["basketball"],
      type: WarmupType.POST,
      description:
        "Low-intensity layups and light shooting to gradually lower heart rate.",
    },
    {
      name: "Lateral Shuffle",
      sports: ["basketball"],
      type: WarmupType.PRE,
      description: "Side-to-side shuffles to prepare for defensive slides.",
    },
    {
      name: "Arm Circles",
      sports: ["basketball"],
      type: WarmupType.PRE,
      description: "Small to large arm circles to warm up shoulders for shooting.",
    },
    {
      name: "Butt Kicks",
      sports: ["basketball"],
      type: WarmupType.PRE,
      description: "Jog with heels kicking toward glutes to warm up hamstrings.",
    },
    {
      name: "Walking Lunges",
      sports: ["basketball"],
      type: WarmupType.PRE,
      description:
        "Dynamic lunges across the court for hip and leg activation.",
    },
    {
      name: "Figure-4 Stretch",
      sports: ["basketball"],
      type: WarmupType.POST,
      description: "Static stretch for glutes and hips after play.",
    },
    {
      name: "Hamstring Stretch",
      sports: ["basketball"],
      type: WarmupType.POST,
      description:
        "Static hamstring stretch to reduce tightness after games.",
    },
    {
      name: "Quad Stretch",
      sports: ["basketball"],
      type: WarmupType.POST,
      description: "Standing quad stretch for the front of the thighs.",
    },
    {
      name: "Child's Pose",
      sports: ["basketball"],
      type: WarmupType.POST,
      description: "Gentle stretch for back and hips during cooldown.",
    },
  ];

  await prisma.warmup.deleteMany();
  for (const w of basketballWarmups) {
    await prisma.warmup.create({ data: w });
  }

  console.log("Warmups seeded.");

  const basketballLearnContent = [
    {
      topic: "Basic Rules of Basketball",
      content:
        "Basketball is played between two teams of five players. The goal is to score by shooting the ball through the opponent's hoop.",
      ytLink: "https://www.youtube.com/watch?v=oyjYgmsM00g",
    },
    {
      topic: "Shooting Fundamentals",
      content:
        "Focus on balance, elbow alignment, follow-through, and consistent shot mechanics to improve accuracy.",
      ytLink: "https://www.youtube.com/watch?v=ktQkS6S3mCw",
    },
    {
      topic: "Injury Prevention",
      content:
        "Proper warmup, strength training, and landing mechanics help reduce ankle and knee injuries.",
      ytLink: "https://www.youtube.com/watch?v=1xSqt-F8Fxo",
    },
    {
      topic: "Ball Handling Drills",
      content:
        "Daily dribbling drills that improve control with both hands and reduce turnover risk.",
      ytLink: "https://www.youtube.com/watch?v=8d-dgkKJwHw",
    },
    {
      topic: "Footwork for Guards",
      content:
        "Learn how to use jab steps, pivots, and efficient footwork to create space on the perimeter.",
      ytLink: "https://www.youtube.com/watch?v=67XJZQ_9L4k",
    },
    {
      topic: "Defensive Stance and Slides",
      content:
        "Techniques for staying low, balanced, and explosive while playing on-ball defense.",
      ytLink: "https://www.youtube.com/watch?v=O48fF_pZceQ",
    },
    {
      topic: "Rebounding Basics",
      content:
        "Positioning, boxing out, and timing tips to become a better rebounder.",
      ytLink: "https://www.youtube.com/watch?v=h0yW3n57Fa4",
    },
    {
      topic: "Conditioning for Basketball",
      content:
        "Court-based conditioning drills to improve game-specific endurance and speed.",
      ytLink: "https://www.youtube.com/watch?v=SQjPOeS9u2E",
    },
    {
      topic: "Knee-Friendly Landing Mechanics",
      content:
        "How to land safely from jumps to protect knees and reduce ACL injury risk.",
      ytLink: "https://www.youtube.com/watch?v=H6aZdlQ5l-E",
    },
    {
      topic: "Ankle Strength and Stability",
      content:
        "Exercises and tips to build strong, stable ankles for cutting and jumping.",
      ytLink: "https://www.youtube.com/watch?v=0t9WFmvxBPE",
    },
  ];

  await prisma.learnContent.deleteMany();
  for (const lc of basketballLearnContent) {
    await prisma.learnContent.create({
      data: {
        sport: "basketball",
        topic: lc.topic,
        content: lc.content,
        ytLink: lc.ytLink,
      },
    });
  }

  console.log("Learn content seeded.");
  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
