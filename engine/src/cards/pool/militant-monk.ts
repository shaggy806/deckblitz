import { defineCard } from "../define.js";

export default defineCard({
  name: "Militant Monk",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk", "Cleric"],
  power: 2,
  toughness: 1,
  keywords: ["vigilance"],
  text: "Vigilance\n{T}: Prevent the next 1 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
  ],
});
