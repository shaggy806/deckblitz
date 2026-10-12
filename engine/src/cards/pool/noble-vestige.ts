import { defineCard } from "../define.js";

export default defineCard({
  name: "Noble Vestige",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{T}: Prevent the next 1 damage that would be dealt to target player or planeswalker this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player-or-planeswalker"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{T}: Prevent the next 1 damage that would be dealt to target player or planeswalker this turn.",
    },
  ],
});
