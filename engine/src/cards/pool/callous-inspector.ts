import { defineCard } from "../define.js";

// EDHREC rank 16447. The damage is the dead creature's, read as it last
// existed (City of Brass's `who: "you"`).
const DIES_TEXT =
  "When this creature dies, it deals 1 damage to you. Create a Clue token. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Callous Inspector",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "you" },
          { kind: "create-token", token: "Clue Token", count: 1 },
        ],
      },
      resolve: null,
      text: "When this creature dies, it deals 1 damage to you. Create a Clue token.",
    },
  ],
});
