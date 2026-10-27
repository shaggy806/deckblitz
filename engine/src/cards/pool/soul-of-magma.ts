import { defineCard } from "../define.js";

// EDHREC rank 28718.

const TEXT = "Whenever you cast a Spirit or Arcane spell, this creature deals 1 damage to target creature.";

export default defineCard({
  name: "Soul of Magma",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: ["creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
