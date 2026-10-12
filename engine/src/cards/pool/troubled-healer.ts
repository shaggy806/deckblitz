import { defineCard } from "../define.js";

export default defineCard({
  name: "Troubled Healer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: "Sacrifice a land: Prevent the next 2 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "land" } } },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: "Sacrifice a land: Prevent the next 2 damage that would be dealt to any target this turn.",
    },
  ],
});
