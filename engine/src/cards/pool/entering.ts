import { defineCard } from "../define.js";

const FACES = ["Breaking // Entering", "Breaking", "Entering"];

// The right half of Breaking // Entering (see breaking-entering.ts).
export default defineCard({
  name: "Entering",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Put a creature card from a graveyard onto the battlefield under your control. It gains haste until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "graveyards",
    min: 1,
    max: 1,
    destination: "battlefield",
    leftover: "stay",
    filter: { type: "creature" },
    then: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
  },
  faces: FACES,
  split: true,
});
