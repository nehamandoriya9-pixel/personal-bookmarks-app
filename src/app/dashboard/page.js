import { getRequiredUser } from "@/lib/supabase/auth";
import { getBookmarks } from "@/lib/supabase/bookmarks";
import { signOut } from "@/app/actions/auth";
import BookmarkList from "@/components/BookmarkList";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import HandleForm from "@/components/HandleForm";

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

  return (
    <div className="min-h-screen bg-[#080808]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        :root { color-scheme: dark; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0d0d0d" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#d4b96a", letterSpacing: "-0.5px" }}>mark</span>
            <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 12 }}>|</span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{displayName}</span>
          </div>
          <form action={signOut}>
            <button type="submit" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 6 }}>
              sign out
            </button>
          </form>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "total", value: bookmarks?.length ?? 0 },
            { label: "public", value: publicCount },
            { label: "favorites", value: favCount },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px" }}>
              <p style={{ fontSize: 28, fontWeight: 300, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: "6px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Handle */}
        <section style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px" }}>
          <h2 style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Public profile</h2>
          {profile?.handle
            ? <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: "0 0 14px" }}>
                Anyone can visit{" "}
                <a href={`/${profile.handle}`} target="_blank" rel="noopener noreferrer" style={{ color: "#d4b96a", textDecoration: "none" }}>
                  /{profile.handle}
                </a>{" "}
                to see your public bookmarks.
              </p>
            : <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: "0 0 14px" }}>Set a handle to get a shareable profile link.</p>
          }
          <HandleForm currentHandle={profile?.handle ?? ""} />
        </section>

        {/* Add bookmark */}
        <section style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px" }}>
          <h2 style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>Add bookmark</h2>
          <AddBookmarkForm />
        </section>

        {/* List */}
        <section>
          <h2 style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
            Your bookmarks <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>({bookmarks?.length ?? 0})</span>
          </h2>
          <BookmarkList bookmarks={bookmarks ?? []} />
        </section>
      </main>
    </div>
  );
}