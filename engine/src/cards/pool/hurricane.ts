import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 8953.
//
// Earthquake's shape, for the fliers: one simultaneous damage event, and
// flying read as it resolves (the ruling).
export default defineCard({
  name: "Hurricane",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Hurricane deals X damage to each creature with flying and each player.",
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: "x" },
      { kind: "damage", amount: "x", who: "each-player" },
    ],
  },
});
