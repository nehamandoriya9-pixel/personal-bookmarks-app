"use client";
import { useActionState, useEffect, useState } from "react";
// import { useActionState } from "react";
import { updateHandle } from "@/app/actions/bookmarks";

const init = { error: null, success: false };

export default function HandleForm({ currentHandle }) {
  const [state, formAction, isPending] = useActionState(updateHandle, init);
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
    <form action={formAction} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden", maxWidth: 260 }}>
        <span style={{ paddingLeft: 12, fontSize: 13, color: "rgba(255,255,255,0.2)", userSelect: "none" }}>@</span>
        <input
          name="handle"
          type="text"
          defaultValue={currentHandle}
          placeholder="your-handle"
          minLength={3}
          maxLength={30}
          pattern="[a-zA-Z0-9_\-]+"
          style={{ flex: 1, background: "none", border: "none", padding: "8px 10px", fontSize: 13, color: "rgba(255,255,255,0.75)", outline: "none", fontFamily: "inherit" }}
        />
      </div>

      <button type="submit" disabled={isPending}
        style={{ padding: "7px 16px", borderRadius: 8, background: "rgba(212,185,106,0.12)", border: "1px solid rgba(212,185,106,0.25)", color: "#d4b96a", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", opacity: isPending ? 0.5 : 1, flexShrink: 0 }}>
        {isPending ? "Saving…" : currentHandle ? "Update handle" : "Set handle"}
      </button>

      {state?.error && <p style={{ fontSize: 11, color: "#f87171", margin: 0 }}>{state.error}</p>}
      {showSuccess && <p style={{ fontSize: 11, color: "#34d399", margin: 0 }}>@{state.handle} saved!</p>}
    </form>
  );
}