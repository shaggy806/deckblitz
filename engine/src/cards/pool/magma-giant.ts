import { defineCard } from "../define.js";

// EDHREC rank 22093. Dakmor Plague's damage, from an enters
// trigger.

const TEXT = "When this creature enters, it deals 2 damage to each creature and each player.";

export default defineCard({
  name: "Magma Giant",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 2 },
          { kind: "damage", amount: 2, who: "each-player" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
