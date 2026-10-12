import { defineCard } from "../define.js";

export default defineCard({
  name: "Alabaster Wall",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n{T}: Prevent the next 1 damage that would be dealt to any target this turn.",
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
