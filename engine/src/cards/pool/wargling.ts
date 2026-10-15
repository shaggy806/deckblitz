import { defineCard } from "../define.js";

// EDHREC rank 16825.
//
// Rulings:
//   [2026-06-29] Wargling's triggered ability will check when it attacks to see if you control a
//     creature with power 4 or greater. If you don't, the ability won't trigger at all. It will
//     not check again when it resolves, so the ability will resolve even if you no longer control
//     a creature with power 4 or greater.
//
// "While you control …" is part of the trigger condition (`whileCondition`,
// Ruby, Daring Tracker), asked only as it attacks — the ruling. The trample
// goes to the creatures you control as it resolves (rule 611.2c).

const TEXT =
  "Ferocious — Whenever this creature attacks while you control a creature with power 4 or greater, until end of turn, this creature gets +1/+0 and creatures you control gain trample.";

export default defineCard({
  name: "Wargling",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
