// app/layout.jsx
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth"; // 👈 importa o auth do NextAuth v5

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "EhgCorp",
  description: "Enterprise portal",
};

export default async function RootLayout({ children }) {
  // 👇 pega a sessão no servidor (SSR)
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SessionProvider session={session} refetchInterval={300} refetchOnWindowFocus>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
