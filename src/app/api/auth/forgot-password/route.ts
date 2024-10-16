// src/app/api/auth/forgot-password/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { email } = await request.json();

  // Check if the user exists in the database
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // We do not want to reveal if the email exists for security reasons
    return NextResponse.json({ message: 'If this email exists, a password reset link will be sent.' }, { status: 200 });
  }

  // Generate a reset token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

  // Save token to the user in the database
  await prisma.user.update({
    where: { email },
    data: { resetPasswordToken: token, resetPasswordTokenExpiry: tokenExpiry },
  });

  // Send the email with the reset link (replace with your domain)
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
  });

  return NextResponse.json({ message: 'If this email exists, a password reset link will be sent.' }, { status: 200 });
}
