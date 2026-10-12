import { defineCard } from "../define.js";

export default defineCard({
  name: "Aven Redeemer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{T}: Prevent the next 2 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: "{T}: Prevent the next 2 damage that would be dealt to any target this turn.",
    },
  ],
});
