import type { Metadata } from "next";
import localFont from "next/font/local";
import { SignInScreen } from "@/components/auth/sign-in-screen";
import { AppShell } from "@/components/crm/app-shell";
import { hasLocalAdminCredentials } from "@/lib/auth/session";
import { getAuthErrorMessage, getCurrentUser } from "@/lib/auth/session";
import { hasMicrosoftAuthConfig } from "@/lib/auth/microsoft";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "The Hub",
  description: "Creative Sales Consulting CRM and project management platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {currentUser ? (
          <AppShell currentUser={currentUser}>{children}</AppShell>
        ) : (
          <SignInScreen
            authError={getAuthErrorMessage()}
            microsoftConfigured={hasMicrosoftAuthConfig()}
            localAdminConfigured={hasLocalAdminCredentials()}
          />
        )}
      </body>
    </html>
  );
}
