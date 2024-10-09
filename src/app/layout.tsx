// src/app/layout.tsx
import '@/styles/globals.css';

export const metadata = {
  title: 'PulseCheck',
  description: 'Feedback app for students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
