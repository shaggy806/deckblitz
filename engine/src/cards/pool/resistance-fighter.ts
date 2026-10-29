import { defineCard } from "../define.js";

// EDHREC rank 27958.

export default defineCard({
  name: "Resistance Fighter",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: Prevent all combat damage target creature would deal this turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
      resolve: null,
      text: "Sacrifice this creature: Prevent all combat damage target creature would deal this turn.",
    },
  ],
});
