import React from "react";
import { AdminShellLayout } from "@/src/components/siae/AdminShellLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShellLayout>{children}</AdminShellLayout>;
}
