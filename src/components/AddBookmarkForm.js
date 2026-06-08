"use client";

import { useActionState, useState, useEffect } from "react";
import { addBookmark } from "@/app/actions/bookmarks";

const init = { error: null, success: false };

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  color: "rgba(255,255,255,0.75)",
  outline: "none",
  transition: "border-color 0.15s",
  fontFamily: "inherit",
};

function Toggle({ name, label, defaultChecked = false }) {
  const [on, setOn] = useState(defaultChecked);

  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
      <input type="hidden" name={name} value={on ? "on" : "off"} />
      <div
        onClick={() => setOn(!on)}
        style={{
          width: 32, height: 18, borderRadius: 9,
          background: on ? "rgba(212,185,106,0.5)" : "rgba(255,255,255,0.1)",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 3, left: on ? 15 : 3, width: 12, height: 12,
          borderRadius: "50%", background: on ? "#d4b96a" : "rgba(255,255,255,0.4)",
          transition: "left 0.2s, background 0.2s",
        }} />
      </div>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{label}</span>
    </label>
  );
}

export default function AddBookmarkForm() {
  const [state, formAction, isPending] = useActionState(addBookmark, init);
  const [expanded, setExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
  
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
  
      return () => clearTimeout(timer);
    }
  }, [state?.success]);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {state?.error && (
        <p style={{ fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "8px 12px", margin: 0 }}>
          {state.error}
        </p>
      )}
      {showSuccess && (
        <p style={{ fontSize: 12, color: "#34d399", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "8px 12px", margin: 0 }}>
          Bookmark saved.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input name="title" type="text" placeholder="Title" required style={inputStyle}
          onFocus={e => e.target.style.borderColor = "rgba(212,185,106,0.4)"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
        />
        <input name="url" type="text" placeholder="https://example.com" required style={inputStyle}
          onFocus={e => e.target.style.borderColor = "rgba(212,185,106,0.4)"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
        />
      </div>

      {/* Expandable: description + tags */}
      {expanded && (
        <>
          <textarea name="description" placeholder="Description (optional)" rows={2} style={{ ...inputStyle, resize: "vertical" }}
            onFocus={e => e.target.style.borderColor = "rgba(212,185,106,0.4)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
          <input name="tags" type="text" placeholder="Tags (comma-separated: react, design, tools)" style={inputStyle}
            onFocus={e => e.target.style.borderColor = "rgba(212,185,106,0.4)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
        </>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Toggle name="is_public" label="Public" />
          <Toggle name="is_favorite" label="Favorite" />
          <button type="button" onClick={() => setExpanded(!expanded)}
            style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
            {expanded ? "− less" : "+ description & tags"}
          </button>
        </div>

        <button type="submit" disabled={isPending}
          style={{ padding: "7px 18px", borderRadius: 8, background: "rgba(212,185,106,0.12)", border: "1px solid rgba(212,185,106,0.25)", color: "#d4b96a", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "background 0.15s", fontFamily: "inherit", opacity: isPending ? 0.5 : 1 }}>
          {isPending ? "Saving…" : "Add bookmark"}
        </button>
      </div>
    </form>
  );
}