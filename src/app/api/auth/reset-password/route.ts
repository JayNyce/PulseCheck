// src/app/api/auth/reset-password/route.ts

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { password, token } = await request.json();

    if (!password || !token) {
      return NextResponse.json({ message: 'Password and token are required' }, { status: 400 });
    }

    // Find user by reset token and check if token is still valid
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Token is invalid or has expired' }, { status: 400 });
    }

    // Hash the new password and update the user
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password successfully reset' }, { status: 200 });
  } catch (error) {
    console.error('Error in reset-password route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
