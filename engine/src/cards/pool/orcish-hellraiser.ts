import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 27764.

export default defineCard({
  name: "Orcish Hellraiser",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 3,
  toughness: 2,
  text: "Echo {R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature dies, it deals 2 damage to target player or planeswalker.",
  triggered: [
    echo("{R}"),
    {
      trigger: { on: "dies", who: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature dies, it deals 2 damage to target player or planeswalker.",
    },
  ],
});
