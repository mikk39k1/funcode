import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { SideNav } from "@/components/layout/SideNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await db.user.findUnique({
    where: { authId: user.id },
    select: { username: true, totalXp: true },
  });

  if (!profile) redirect("/login");

  const level = Math.floor(profile.totalXp / 500) + 1;
  const titles = ["Apprentice", "Craftsman", "Artisan", "Master", "Grand Master"];
  const title = titles[Math.min(Math.floor(level / 10), titles.length - 1)];

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <SideNav
        username={profile.username}
        level={level}
        title={title}
      />
      <main className="flex-1 min-w-0 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
