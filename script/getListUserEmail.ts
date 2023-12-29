import prisma from '../src/provider/Client';

const start = async () => {
  const data = await prisma.users.findMany({
    select: {
      user_email: true,
    },
  });

  for (const item of data) {
    console.log(item.user_email);
  }
};

start();
