import type { Metadata } from "next";

import { AdminLogin } from "@/components/admin/admin-login";

export const metadata: Metadata = {
  title: "Admin login | Limex",
  description: "Sign in to manage the Limex website.",
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
