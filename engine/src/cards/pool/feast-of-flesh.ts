import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 31338.
//
// X is read once per use as it resolves; this spell is on the stack then, so
// it doesn't count itself.

const X = { sum: [1, { countInGraveyard: { name: "Feast of Flesh" } }] } as const;

export default defineCard({
  name: "Feast of Flesh",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Feast of Flesh deals X damage to target creature and you gain X life, where X is 1 plus the number of cards named Feast of Flesh in all graveyards.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", target: 0, amount: X },
      { kind: "gain-life", amount: X },
    ],
  },
});
