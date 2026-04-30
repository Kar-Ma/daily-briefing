"use client";

import { useState } from "react";
import { setLocation } from "./actions";

export default function LocationSwitcher({ label }: { label: string }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await setLocation(formData);
          setEditing(false);
        }}
        className="inline-flex"
      >
        <input
          type="text"
          name="city"
          defaultValue={label}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(false);
          }}
          onBlur={() => setEditing(false)}
          className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="City name"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="rounded px-1.5 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
    >
      📍 {label}
    </button>
  );
}
