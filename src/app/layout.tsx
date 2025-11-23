import type { Metadata } from "next";
import "./globals.css";
import Layout from "../components/Layout";

export const metadata: Metadata = {
  title: "Lost Item Identifier",
  description:
    "Verify if a lost item is really yours using AI-powered quizzes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
