// auth.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function signUp(username: string, password: string) {
  const user = await prisma.user.create({
    data: {
      username,
      password, // Note: password should be hashed in a real-world application
    },
  });
  return user;
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user?.password === password ? user : null; // Again, you should hash and verify passwords properly
}
