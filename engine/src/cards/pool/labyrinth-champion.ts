import { defineCard } from "../define.js";

const TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, this creature deals 2 damage to any target.";

export default defineCard({
  name: "Labyrinth Champion",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
