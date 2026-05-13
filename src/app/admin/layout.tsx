import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sess = await getCurrentSession();
  if (!sess) redirect("/login?next=/admin");
  if (sess.role !== "admin") redirect("/home");

  return <AdminShell user={{ email: sess.email, campus: sess.campus }}>{children}</AdminShell>;
}
