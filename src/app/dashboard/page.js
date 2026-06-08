import { getRequiredUser } from "@/lib/supabase/auth";
import { getBookmarks } from "@/lib/supabase/bookmarks";
import { signOut } from "@/app/actions/auth";
import BookmarkList from "@/components/BookmarkList";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import HandleForm from "@/components/HandleForm";
import Link from "next/link";

export const metadata = { title: "Dashboard · Mark" };

export default async function DashboardPage() {
  const { supabase, user } = await getRequiredUser();

  const [{ data: profile }, bookmarks] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, email, handle")
      .eq("id", user.id)
      .maybeSingle(),
    getBookmarks(user.id),
  ]);

  const displayName = profile?.display_name || profile?.email || user.email;
  const publicCount = bookmarks?.filter((b) => b.is_public).length ?? 0;
  const favCount = bookmarks?.filter((b) => b.is_favorite).length ?? 0;

  const glassCard = {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    borderRadius: 28,
    boxShadow: "0 0 40px rgba(255,255,255,0.05)",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-black"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');

        * {
          box-sizing: border-box;
        }

        :root {
          color-scheme: dark;
        }
      `}</style>

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[180px]" />

        <div className="absolute bottom-[-150px] left-[-100px] h-[450px] w-[450px] rounded-full bg-white/[0.03] blur-[140px]" />

        <div className="absolute right-[-120px] top-[20%] h-[420px] w-[420px] rounded-full bg-white/[0.03] blur-[150px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-3xl">
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 30,
                letterSpacing: "-0.5px",
                background:
                  "linear-gradient(90deg,#ffffff,#e5e5e5,#8f8f8f)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              mark
            </span>

            <span style={{ color: "rgba(255,255,255,0.15)" }}>
              |
            </span>

            <span
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 14,
              }}
            >
              {displayName}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <Link
              href="/"
              className="
                rounded-2xl
                border border-white/15
                bg-white/[0.05]
                px-4 py-2
                text-sm text-white/80
                backdrop-blur-xl
                transition-all
                hover:border-white/25
                hover:bg-white/[0.08]
              "
            >
              ← Home
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="
                  rounded-2xl
                  border border-white/15
                  bg-white/[0.05]
                  px-4 py-2
                  text-sm text-white/80
                  backdrop-blur-xl
                  transition-all
                  hover:border-white/25
                  hover:bg-white/[0.08]
                "
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
          }}
        >
          {[
            { label: "total", value: bookmarks?.length ?? 0 },
            { label: "public", value: publicCount },
            { label: "favorites", value: favCount },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                ...glassCard,
                padding: "22px 24px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "15%",
                  right: "15%",
                  height: 1,
                  background:
                    "linear-gradient(90deg,transparent,#fff,transparent)",
                }}
              />

              <p
                style={{
                  fontSize: 34,
                  fontWeight: 300,
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {value}
              </p>

              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  margin: "8px 0 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Public Profile */}
        <section
          style={{
            ...glassCard,
            padding: 28,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: 1,
              background:
                "linear-gradient(90deg,transparent,#fff,transparent)",
            }}
          />

          <h2
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 8px",
            }}
          >
            Public Profile
          </h2>

          {profile?.handle ? (
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                margin: "0 0 18px",
              }}
            >
              Anyone can visit{" "}
              <a
                href={`/${profile.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  textShadow:
                    "0 0 12px rgba(255,255,255,0.45)",
                }}
              >
                /{profile.handle}
              </a>{" "}
              to see your public bookmarks.
            </p>
          ) : (
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                margin: "0 0 18px",
              }}
            >
              Set a handle to get a shareable profile link.
            </p>
          )}

          <HandleForm currentHandle={profile?.handle} />
        </section>

        {/* Add Bookmark */}
        <section
          style={{
            ...glassCard,
            padding: 28,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: 1,
              background:
                "linear-gradient(90deg,transparent,#fff,transparent)",
            }}
          />

          <h2
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 18px",
            }}
          >
            Add Bookmark
          </h2>

          <AddBookmarkForm />
        </section>

        {/* Bookmark List */}
        <section>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 14px",
            }}
          >
            Your Bookmarks{" "}
            <span
              style={{
                color: "rgba(255,255,255,0.35)",
                fontWeight: 400,
              }}
            >
              ({bookmarks?.length ?? 0})
            </span>
          </h2>

          <BookmarkList bookmarks={bookmarks ?? []} />
        </section>
      </main>
    </div>
  );
}