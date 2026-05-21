import { requireRole } from "@/lib/auth/roles";
import AdminShell from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");
  return <AdminShell>{children}</AdminShell>;
}
