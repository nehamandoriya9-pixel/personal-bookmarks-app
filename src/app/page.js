import Link from "next/link";
import { getOptionalUser } from "@/lib/supabase/auth";

export default async function Home() {
  const { user } = await getOptionalUser();

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[180px]" />

        <div className="absolute bottom-[-150px] left-[-100px] h-[400px] w-[400px] rounded-full bg-white/[0.03] blur-[140px]" />

        <div className="absolute right-[-120px] top-[20%] h-[350px] w-[350px] rounded-full bg-white/[0.025] blur-[140px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <div
          className="
            relative overflow-hidden
            rounded-full
            border border-white/15
            bg-white/[0.04]
            px-5 py-2
            text-xs
            uppercase
            tracking-[0.18em]
            text-white/60
            backdrop-blur-2xl translate-y-6
          "
        >
          <span className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          Personal Bookmark Manager
        </div>

        {/* Hero */}
        <h1 className="mt-8 max-w-5xl text-5xl font-bold tracking-tight md:text-7xl">
          Save your favorite links

          <span
            className="
              block
              bg-gradient-to-r
              from-zinc-100
              via-white
              to-zinc-400
              bg-clip-text
              text-transparent
              drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]
            "
          >
            beautifully organized
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/45">
          A private bookmark dashboard with public profiles. Store, organize,
          and share your best resources in a clean and secure workspace.
        </p>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="
                group relative overflow-hidden
                rounded-2xl
                border border-white/20
                bg-gradient-to-br
                from-white/20
                via-white/10
                to-white/5
                px-7 py-3
                text-sm font-medium text-white
                backdrop-blur-2xl
                transition-all duration-300
                hover:-translate-y-1
                hover:border-white/30
              "
            >
              <span className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              Open Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="
                  group relative overflow-hidden
                  rounded-2xl
                  border border-white/20
                  bg-gradient-to-br
                  from-white/20
                  via-white/10
                  to-white/5
                  px-7 py-3
                  text-sm font-medium text-white
                  backdrop-blur-2xl
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-white/30
                "
              >
                <span className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                Get Started
              </Link>

              <Link
                href="/login"
                className="
                  group relative overflow-hidden
                  rounded-2xl
                  border border-white/15
                  bg-white/[0.04]
                  px-7 py-3
                  text-sm font-medium text-white/80
                  backdrop-blur-2xl
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-white/[0.08]
                  hover:text-white
                "
              >
                <span className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                Sign In
              </Link>
            </>
          )}
        </div>
        {/* Feature Cards */}
        <div className="mt-10 grid w-full max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              title: "Private by Default",
              desc: "Your bookmarks remain secure with Supabase authentication and Row Level Security.",
            },
            {
              title: "Public Profiles",
              desc: "Share selected bookmarks through a unique public handle.",
            },
            {
              title: "Simple Organization",
              desc: "Save, edit, categorize, and manage all your important links from one dashboard.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="
                relative overflow-hidden
                rounded-[30px]
                border border-white/15
                bg-gradient-to-br
                from-white/10
                via-white/5
                to-transparent
                p-6
                backdrop-blur-3xl
                transition-all duration-300
                hover:-translate-y-1
                hover:border-white/25
                hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]
              "
            >
              {/* Top Shine */}
              <div className="absolute left-10 right-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

              {/* Bottom Shine */}
              <div className="absolute bottom-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

              {/* Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.10] via-transparent to-transparent" />

              <div className="relative z-10">
                <h3 className="mb-3 text-lg font-semibold text-white">
                  {item.title}
                </h3>

                <p className="text-sm leading-relaxed text-white/50">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}