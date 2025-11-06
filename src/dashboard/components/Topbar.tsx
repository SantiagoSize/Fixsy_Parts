// 🧹 FIXSY CLEANUP: organised structure, no logic changes
import React from "react";

export default function Topbar({ title }: { title: string }) {
  return <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{title}</div>;
}
