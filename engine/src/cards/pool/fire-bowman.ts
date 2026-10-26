import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

const TEXT =
  "Sacrifice this creature: It deals 1 damage to any target. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Fire Bowman",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Archer"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      condition: BEFORE_ATTACKERS_DECLARED,
      resolve: null,
      text: TEXT,
    },
  ],
});
