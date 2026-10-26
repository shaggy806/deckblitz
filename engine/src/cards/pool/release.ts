import { defineCard } from "../define.js";

const FACES = ["Catch // Release", "Catch", "Release"];

// The right half of Catch // Release (see catch-release.ts).
export default defineCard({
  name: "Release",
  manaCost: "{4}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Each player sacrifices an artifact, a creature, an enchantment, a land, and a planeswalker of their choice.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: {
    kind: "sacrifice",
    who: "each-player",
    filter: { type: "artifact" },
    count: 1,
    andEach: [
      { type: "creature" },
      { type: "enchantment" },
      { type: "land" },
      { type: "planeswalker" },
    ],
  },
  faces: FACES,
  split: true,
});
