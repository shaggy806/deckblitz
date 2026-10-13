import { defineCard } from "../define.js";

// EDHREC rank 7091.
//
// Rulings:
//   [2024-07-26] The target of Hearthborn Battler's last ability doesn't have to be the same player
//     who cast their second spell.
const SECOND = "Whenever a player casts their second spell each turn, this creature deals 2 damage to target opponent.";

export default defineCard({
  name: "Hearthborn Battler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warlock"],
  power: 2,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${SECOND}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", nthEachTurn: 2 },
      targets: ["opponent"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: SECOND,
    },
  ],
});
