import { defineCard } from "../define.js";

export default defineCard({
  name: "Caregiver",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{W}, Sacrifice a creature: Prevent the next 1 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "creature-you-control" },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{W}, Sacrifice a creature: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
  ],
});
