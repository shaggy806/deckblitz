import { defineCard } from "../define.js";

// Ruling: a creature that died earlier in the turn, before this entered, counts.
const TEXT =
  "Morbid — {T}: This creature deals 1 damage to any target. Activate only if a creature died this turn.";

export default defineCard({
  name: "Vengeful Devil",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "creature-died-this-turn" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
