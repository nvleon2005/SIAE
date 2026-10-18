import React from "react";
import { AdminShellLayout } from "@/src/components/siae/AdminShellLayout";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShellLayout>{children}</AdminShellLayout>;
}
