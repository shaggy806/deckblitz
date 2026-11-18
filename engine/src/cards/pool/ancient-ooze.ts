import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 15593.
//
// A characteristic-defining ability (rule 604.3): the sum of the mana values
// of the other creatures its controller controls, each token in a stack
// counted, a token and a face-down creature 0 (rule 202.3 — the ruling).
// Mana value isn't a layer-fold characteristic, so the CDA reads the others'
// without a dependency problem.
const TEXT = "Ancient Ooze's power and toughness are each equal to the total mana value of other creatures you control.";

export default defineCard({
  name: "Ancient Ooze",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: {
          aggregate: "sum",
          of: "mana-value",
          filter: { type: "creature", controlledBy: "you" },
          excludeSelf: true,
        },
        plusPower: 0,
        plusToughness: 0,
      },
      text: TEXT,
    },
  ],
});
