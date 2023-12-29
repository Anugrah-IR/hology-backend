import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
import fs from 'fs';

async function seed_admins() {
  const superAdminPit = await prisma.admins.upsert({
    where: {admin_email: 'pit@hology.com'},
    update: {},
    create: {
      admin_email: 'pit@hology.com',
      admin_name: 'Pit',
      admin_password:
        '$2a$10$AEBN4fh28wqAK/Sbl9j0p.uV/gmb7JLb5tRMcNw9ZJ9iO4WHb3SPi',
      admin_role: 'GOD',
    },
  });

  const superAdmin1 = await prisma.admins.upsert({
    where: {admin_email: 'superadmin1@hology.com'},
    update: {},
    create: {
      admin_email: 'superadmin1@hology.com',
      admin_name: 'Super Admin 1',
      admin_password:
        '$2a$10$/S20KxPWjT.OSxaZTZOCBupieE9vfTbDFRNRaLTUmFpAyfdBgqCei',
      admin_role: 'GOD',
    },
  });

  const superAdmin2 = await prisma.admins.upsert({
    where: {admin_email: 'superadmin2@hology.com'},
    update: {},
    create: {
      admin_email: 'superadmin2@hology.com',
      admin_name: 'Super Admin 2',
      admin_password:
        '$2a$10$2oRMcB21PGeBox6DAHnvq.0Kanyt0hI3b.3zdLNrmiROnYGmoNo2a',
      admin_role: 'GOD',
    },
  });

  return {superAdminPit, superAdmin1, superAdmin2};
}

// async function seed_competitions() {
//   const ctf = await prisma.competitions.upsert({
//     where: {competition_name: 'Capture The Flag'},
//     update: {},
//     create: {
//       competition_name: 'Capture The Flag',
//       competition_description: 'Capture the flag',
//       competition_percentage: 0,
//     },
//   });

//   const cp = await prisma.competitions.upsert({
//     where: {competition_name: 'Competitive Programming'},
//     update: {},
//     create: {
//       competition_name: 'Competitive Programming',
//       competition_description: 'Competitive Programming',
//       competition_percentage: 0,
//     },
//   });

//   const business_case = await prisma.competitions.upsert({
//     where: {competition_name: 'Business IT Case'},
//     update: {},
//     create: {
//       competition_name: 'Business IT Case',
//       competition_description: 'Business IT Case',
//       competition_percentage: 0,
//     },
//   });

//   const ux = await prisma.competitions.upsert({
//     where: {competition_name: 'UI / UX Design'},
//     update: {},
//     create: {
//       competition_name: 'UI / UX Design',
//       competition_description: 'UI / UX Design',
//       competition_percentage: 0,
//     },
//   });

//   const smart_device = await prisma.competitions.upsert({
//     where: {competition_name: 'Smart Device'},
//     update: {},
//     create: {
//       competition_name: 'Smart Device',
//       competition_description: 'Smart Device',
//       competition_percentage: 0,
//     },
//   });

//   const app_innovation = await prisma.competitions.upsert({
//     where: {competition_name: 'App Innovation'},
//     update: {},
//     create: {
//       competition_name: 'App Innovation',
//       competition_description: 'App Innovation',
//       competition_percentage: 0,
//     },
//   });

//   const it_paper = await prisma.competitions.upsert({
//     where: {competition_name: 'IT Paper & Poster Competition'},
//     update: {},
//     create: {
//       competition_name: 'IT Paper & Poster Competition',
//       competition_description: 'IT Paper & Poster Competition',
//       competition_percentage: 0,
//     },
//   });

//   return {ctf, cp, business_case, ux, smart_device, app_innovation, it_paper};
// }

interface _institution {
  institution_id: number;
  institution_name: string;
}

async function seed_institutions() {
  const institutions_file = fs.readFileSync(
    __dirname + '/../../institutions.txt',
    'utf8'
  );

  const institution_list: _institution[] = [];
  institutions_file.split('\n').forEach(line => {
    institution_list.push({
      institution_id: institution_list.length + 1,
      institution_name: line,
    });
  });

  // console.log(institution_list);

  const institutions_created = await prisma.institutions.createMany({
    data: institution_list,
  });

  return institutions_created;
}

async function main() {
  const seeded = {
    admins: await seed_admins(),
    institution: await seed_institutions(),
    // competition: await seed_competitions(),
  };
  console.log(seeded);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
  });
