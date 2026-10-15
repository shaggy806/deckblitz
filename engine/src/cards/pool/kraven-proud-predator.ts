import { defineCard } from "../define.js";

// EDHREC rank 18222.
//
// Rulings:
//   [2025-09-19] If a permanent on the battlefield has {X} in its mana cost, X is 0 when
//     determining its mana value.
//
// A power-only CDA over the printed 4 toughness (Daretti, Rocketeer
// Engineer's shape), over every permanent you control — Kraven included.

const PT_TEXT =
  "Top of the Food Chain — Kraven's power is equal to the greatest mana value among permanents you control.";

export default defineCard({
  name: "Kraven, Proud Predator",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Villain"],
  power: 0,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { greatestManaValueOf: { controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: PT_TEXT,
    },
  ],
});
