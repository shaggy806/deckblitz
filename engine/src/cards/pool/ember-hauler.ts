import { defineCard } from "../define.js";

const SAC_TEXT = "{1}, Sacrifice this creature: It deals 2 damage to any target.";

export default defineCard({
  name: "Ember Hauler",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: SAC_TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
