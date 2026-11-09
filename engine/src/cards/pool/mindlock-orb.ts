import { defineCard } from "../define.js";

// Shards of Alara. The search doesn't happen, but "search your library … then
// shuffle" still shuffles and "you may search" can't be chosen (the rulings —
// `playerCantSearchLibrary`, `beginLibrarySearch`, `mayBeDone`).
const TEXT = "Players can't search libraries.";

export default defineCard({
  name: "Mindlock Orb",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, text: TEXT, prohibits: [{ act: "search", who: "each-player" }] }],
});
