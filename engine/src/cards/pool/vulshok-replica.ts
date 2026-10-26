import { defineCard } from "../define.js";

// EDHREC rank 31322. Font of Ire's shape: "it" is the sacrificed Replica,
// dealing the damage through its last-known information.

const TEXT = "{1}{R}, Sacrifice this creature: It deals 3 damage to target player or planeswalker.";

export default defineCard({
  name: "Vulshok Replica",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Berserker"],
  power: 3,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
