import { defineCard } from "../define.js";

// EDHREC rank 9830.
const SCREAM_TEXT =
  "Bio-Plasmic Scream — Whenever you cast a creature spell with mana value 5 or greater, this creature deals 5 damage to any target.";

export default defineCard({
  name: "Screamer-Killer",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${SCREAM_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", manaValue: { op: "gte", n: 5 } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: SCREAM_TEXT,
    },
  ],
});
