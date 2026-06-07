import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicBookmarks } from "@/lib/supabase/bookmarks";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  return { title: `@${handle} · Mark` };
}

export default async function PublicProfilePage({ params }) {
  const { handle } = await params;

  // No getRequiredUser() here — this page is intentionally public
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .ilike("handle", handle) // case-insensitive
    .maybeSingle();

  if (!profile) notFound();

  // getPublicBookmarks always hard-filters is_public = true
  // RLS also enforces this at the DB level — two layers, zero leakage
  const bookmarks = await getPublicBookmarks(profile.id);

  const displayName = profile.display_name || profile.email || `@${handle}`;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#e8e6e0" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap'); * { box-sizing: border-box; }`}</style>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "64px 24px" }}>
        {/* Profile header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 8, fontFamily: "monospace" }}>@{handle}</p>
          <h1 style={{ fontSize: 34, fontFamily: "'Instrument Serif', serif", fontWeight: 400, color: "rgba(255,255,255,0.88)", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            {displayName}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", margin: 0 }}>
            {bookmarks.length} public bookmark{bookmarks.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Bookmarks */}
        {bookmarks.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: 48, border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 14 }}>
            No public bookmarks yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bookmarks.map(b => {
              const hostname = (() => {
                try { return new URL(b.url).hostname.replace(/^www\./, ""); }
                catch { return b.url; }
              })();

              return (
                <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, background: "#111", padding: "16px 20px", textDecoration: "none", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                    alt="" width={15} height={15}
                    style={{ marginTop: 2, borderRadius: 3, opacity: 0.5, flexShrink: 0 }}
                    onError={e => e.target.style.display = "none"}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", margin: "2px 0 0" }}>{hostname}</p>
                    {b.description && (
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "6px 0 0", lineHeight: 1.5 }}>{b.description}</p>
                    )}
                    {b.tags?.length > 0 && (
                      <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
                        {b.tags.map(t => (
                          <span key={t} style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: "1px 6px" }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 14, flexShrink: 0, marginTop: 1 }}>↗</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 64, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <a href="/" style={{ fontSize: 13, fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "rgba(255,255,255,0.18)", textDecoration: "none" }}>mark</a>
        </div>
      </div>
    </div>
  );
}