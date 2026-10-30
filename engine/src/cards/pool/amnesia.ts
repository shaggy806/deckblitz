import { defineCard } from "../define.js";

// EDHREC rank 24094.

export default defineCard({
  name: "Amnesia",
  manaCost: "{3}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player reveals their hand and discards all nonland cards.",
  targets: ["player"],
  effect: { kind: "discard-hand", who: 0, filter: { notTypes: ["land"] }, reveal: true },
});
