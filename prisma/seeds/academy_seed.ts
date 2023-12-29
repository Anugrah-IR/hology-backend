import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

async function seed_institutions() {
  const academy1 = await prisma.academy.upsert({
    where: {academy_id: 1},
    update: {},
    create: {
      academy_name: 'UI/UX',
      academy_description: 'Description',
    },
  });

  const academy2 = await prisma.academy.upsert({
    where: {academy_id: 2},
    update: {},
    create: {
      academy_name: 'Web Development',
      academy_description: 'Description',
    },
  });

  const academy3 = await prisma.academy.upsert({
    where: {academy_id: 1},
    update: {},
    create: {
      academy_name: 'Data Science',
      academy_description: 'Description',
    },
  });

  return {academy1, academy2, academy3};
}

async function main() {
  const seeded = await seed_institutions();
  console.log(seeded);
}

main();
