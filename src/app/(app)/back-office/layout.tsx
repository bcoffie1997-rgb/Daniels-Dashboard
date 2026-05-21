import { requireRole } from "@/lib/auth/roles";
import BackOfficeShell from "./back-office-shell";

export default async function BackOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("manager");
  return <BackOfficeShell>{children}</BackOfficeShell>;
}
