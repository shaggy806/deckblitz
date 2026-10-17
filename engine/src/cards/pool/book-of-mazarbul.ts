import { defineCard } from "../define.js";

// EDHREC rank 8859.
// Makes Orc Army by amassing → the engine's "Army Token".
//
// Rulings:
//   [2023-06-16] The last chapter ability affects only creatures you control at the time it
//     resolves. Any creatures that come under your control later in the turn won't be affected.

const I_TEXT = "I — Amass Orcs 1.";
const II_TEXT = "II — Amass Orcs 2.";
const III_TEXT = "III — Creatures you control get +1/+0 and gain menace until end of turn.";
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Book of Mazarbul",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    "I — Amass Orcs 1. (Put a +1/+1 counter on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)\n" +
    `${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "amass", amount: 1, creatureType: "Orc" },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "amass", amount: 2, creatureType: "Orc" },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
