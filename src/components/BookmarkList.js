"use client";

import { useState, useActionState, useEffect} from "react";
import { editBookmark, removeBookmark, toggleFavorite } from "@/app/actions/bookmarks";
import { TbEdit } from "react-icons/tb";
import { MdDeleteForever } from "react-icons/md";
import { FaRegStar } from "react-icons/fa";
import { MdOutlineStarPurple500 } from "react-icons/md";

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: "7px 11px",
  fontSize: 12,
  color: "rgba(255,255,255,0.75)",
  outline: "none",
  fontFamily: "inherit",
};

function Toggle({ name, label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
      <div onClick={onChange} style={{
        width: 28, height: 16, borderRadius: 8,
        background: checked ? "rgba(212,185,106,0.5)" : "rgba(255,255,255,0.08)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 2, left: checked ? 12 : 2, width: 12, height: 12,
          borderRadius: "50%", background: checked ? "#d4b96a" : "rgba(255,255,255,0.35)",
          transition: "left 0.18s",
        }} />
      </div>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{label}</span>
    </label>
  );
}

function EditForm({ bookmark, onCancel }) {
  const [state, formAction, isPending] = useActionState(editBookmark, {});
  const [isPublic, setIsPublic] = useState(bookmark.is_public);
  const [isFav, setIsFav] = useState(bookmark.is_favorite);

  useEffect(() => {
    if (state?.success) {
      onCancel();
    }
  }, [state?.success, onCancel]);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
      <input type="hidden" name="id" value={bookmark.id} />
      <input type="hidden" name="is_public" value={isPublic ? "on" : "off"} />
      <input type="hidden" name="is_favorite" value={isFav ? "on" : "off"} />

      {state?.error && <p style={{ fontSize: 11, color: "#f87171", margin: 0 }}>{state.error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input name="title" defaultValue={bookmark.title} required style={inputStyle} placeholder="Title" />
        <input name="url" defaultValue={bookmark.url} required style={inputStyle} placeholder="URL" />
      </div>
      <textarea name="description" defaultValue={bookmark.description ?? ""} rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="Description (optional)" />
      <input name="tags" defaultValue={(bookmark.tags ?? []).join(", ")} style={inputStyle} placeholder="Tags (comma-separated)" />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 14 }}>
          <Toggle name="is_public" label="Public" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
          <Toggle name="is_favorite" label="Favorite" checked={isFav} onChange={() => setIsFav(!isFav)} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onCancel} style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", padding: "5px 10px", fontFamily: "inherit" }}>Cancel</button>
          <button type="submit" disabled={isPending} style={{ fontSize: 11, padding: "5px 14px", borderRadius: 7, background: "rgba(212,185,106,0.12)", border: "1px solid rgba(212,185,106,0.25)", color: "#d4b96a", cursor: "pointer", fontFamily: "inherit", opacity: isPending ? 0.5 : 1 }}>
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}

function BookmarkRow({ bookmark }) {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);

  const hostname = (() => {
    try { return new URL(bookmark.url).hostname.replace(/^www\./, ""); }
    catch { return bookmark.url; }
  })();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 12, background: "#111", padding: "14px 18px",
        transition: "border-color 0.15s",
      }}
    >
      {!editing ? (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* Favicon */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
            alt="" width={14} height={14}
            style={{ marginTop: 2, borderRadius: 3, opacity: 0.55, flexShrink: 0 }}
            onError={e => e.target.style.display = "none"}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.78)", textDecoration: "none", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {bookmark.title}  ↗
              </a>
              {bookmark.is_favorite && (
                <span style={{ fontSize: 10, color: "#d4b96a" }}>★</span>
              )}
              <span style={{ fontSize: 10, color: bookmark.is_public ? "rgba(212,185,106,0.55)" : "rgba(255,255,255,0.2)", border: `1px solid ${bookmark.is_public ? "rgba(212,185,106,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: "1px 7px" }}>
                {bookmark.is_public ? "public" : "private"}
              </span>
            </div>

            {/* URL */}
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hostname}</p>

            {/* Description */}
            {bookmark.description && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "5px 0 0", lineHeight: 1.5 }}>{bookmark.description}</p>
            )}

            {/* Tags */}
            {bookmark.tags?.length > 0 && (
              <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                {bookmark.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: "1px 6px" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 4, opacity: hovered ? 1 : 0, transition: "opacity 0.15s", flexShrink: 0 }}>
            {/* Favorite toggle */}
            <form action={toggleFavorite}>
              <input type="hidden" name="id" value={bookmark.id} />
              <input type="hidden" name="is_favorite" value={String(bookmark.is_favorite)} />
              <button type="submit" title={bookmark.is_favorite ? "Unfavorite" : "Favorite"}
                style={{ padding: "5px 7px", borderRadius: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: bookmark.is_favorite ? "#d4b96a" : "rgba(255,255,255,0.25)" }}>
                {bookmark.is_favorite ? <MdOutlineStarPurple500 className="w-4 h-4 text-yellow-500"/> : <FaRegStar className="w-4 h-4 text-yellow-100"/>}
              </button>
            </form>

            {/* Edit */}
            <button onClick={() => setEditing(true)} title="Edit"
              style={{ padding: "5px 7px", borderRadius: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
              <TbEdit className="w-4 h-4 text-yellow-100" />
            </button>

            {/* Delete */}
            <form action={removeBookmark}>
              <input type="hidden" name="id" value={bookmark.id} />
              <button type="submit" title="Delete"
                onClick={e => { if (!confirm(`Delete "${bookmark.title}"?`)) e.preventDefault(); }}
                style={{ padding: "5px 7px", borderRadius: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                <MdDeleteForever className="w-4 h-4 text-yellow-100"/>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <EditForm bookmark={bookmark} onCancel={() => setEditing(false)} />
      )}
    </div>
  );
}

export default function BookmarkList({ bookmarks }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = bookmarks.filter(b => {
    
    if (filter === "public") return b.is_public;
    if (filter === "private") return !b.is_public;
    if (filter === "favorites") return b.is_favorite;
    return true;
  }).filter(b => {
    
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.url?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      b.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  if (bookmarks.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "56px 24px", color: "rgba(255,255,255,0.18)", fontSize: 13, border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 14 }}>
        No bookmarks yet — add your first one above.
      </div>
    );
  }

  return (
    <div>
        <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search bookmarks…"
        style={{
          width: "100%",
          marginBottom: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 13,
          color: "rgba(255,255,255,0.75)",
          outline: "none",
          fontFamily: "inherit",
        }}
      />
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {["all", "public", "private", "favorites"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              borderColor: filter === f ? "rgba(212,185,106,0.3)" : "rgba(255,255,255,0.07)",
              background: filter === f ? "rgba(212,185,106,0.1)" : "transparent",
              color: filter === f ? "#d4b96a" : "rgba(255,255,255,0.3)",
            }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0
          ? <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: 32 }}>
              {query ? `No results for "${query}"` : "No bookmarks match this filter."}
            </p>
          : filtered.map(b => <BookmarkRow key={b.id} bookmark={b} />)
        }
      </div>
    </div>
  );
}