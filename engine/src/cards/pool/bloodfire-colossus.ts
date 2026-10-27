import { defineCard } from "../define.js";

// Apocalypse (APC). Festering Evil's shape: the sacrificed Colossus deals the
// damage, as it last existed.
const TEXT = "{R}, Sacrifice this creature: It deals 6 damage to each creature and each player.";

export default defineCard({
  name: "Bloodfire Colossus",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 6,
  toughness: 6,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 6 },
          { kind: "damage", amount: 6, who: "each-player" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
