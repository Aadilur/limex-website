import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "hello@limex.local" },
    update: { name: "Limex Admin" },
    create: {
      email: "hello@limex.local",
      name: "Limex Admin",
    },
  });

  console.log("Database seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
