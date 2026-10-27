import { defineCard } from "../define.js";

// EDHREC rank 16575.

export default defineCard({
  name: "Tectonic Break",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player sacrifices X lands of their choice.",
  targets: [],
  effect: { kind: "sacrifice", who: "each-player", filter: { type: "land" }, count: "x" },
});
