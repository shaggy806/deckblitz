import { defineCard } from "../define.js";

const TEXT = "{T}: This creature deals 2 damage to any target and 3 damage to itself.";

// One instruction: both are dealt at once. Itself isn't a target, so hexproof or
// protection from its own colour doesn't stop the ability, and once it has left
// the battlefield the 2 damage is still dealt, as it last existed (rule 608.2h).
export default defineCard({
  name: "Psionic Entity",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "damage", amount: 3, target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
