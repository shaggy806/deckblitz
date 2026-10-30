import { defineCard } from "../define.js";

// EDHREC rank 31880.

export default defineCard({
  name: "Trapfinder's Trick",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player reveals their hand and discards all Trap cards.",
  targets: ["player"],
  effect: { kind: "discard-hand", who: 0, filter: { subtype: "Trap" }, reveal: true },
});
