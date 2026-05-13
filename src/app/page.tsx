// Splash page — redirects to /home if signed in, otherwise /login.
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { Logo } from "@/components/icons";

export default async function HomePage() {
  const sess = await getCurrentSession();
  if (sess) redirect("/home");
  return (
    <main className="cf-shell flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center gap-5 pt-14 pb-9 px-6">
        <Logo size={64} />
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-2xl font-semibold text-cf-slateDk tracking-tight">CampusFind</div>
          <div className="text-xs text-cf-slate">Lost it on campus? Find it here.</div>
        </div>
        <a
          href="/login"
          className="mt-10 inline-flex items-center justify-center h-12 px-8 rounded-lg bg-cf-blue text-cf-text font-semibold text-[15px]"
        >
          Continue
        </a>
      </div>
      <div className="pb-6 flex justify-center gap-1.5 opacity-50">
        <span className="w-[18px] h-[3px] bg-cf-blue rounded" />
        <span className="w-[6px] h-[3px] bg-[rgba(70,75,85,0.18)] rounded" />
      </div>
    </main>
  );
}
