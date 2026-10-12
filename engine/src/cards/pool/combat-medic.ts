import { defineCard } from "../define.js";

export default defineCard({
  name: "Combat Medic",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Soldier"],
  power: 0,
  toughness: 2,
  text: "{1}{W}: Prevent the next 1 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{1}{W}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
  ],
});
