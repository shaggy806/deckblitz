import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 12204.
//
// Rulings:
//   [2016-06-08] Once Mogg Fanatic has dealt and been dealt combat damage, it's too late to
//     activate its ability before it's destroyed.

const TEXT = "Sacrifice this creature: It deals 1 damage to any target.";

export default defineCard({
  name: "Mogg Fanatic",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
