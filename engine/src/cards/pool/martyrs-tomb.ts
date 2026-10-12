import { defineCard } from "../define.js";

export default defineCard({
  name: "Martyrs' Tomb",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: "Pay 2 life: Prevent the next 1 damage that would be dealt to target creature this turn.",
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 2 },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "Pay 2 life: Prevent the next 1 damage that would be dealt to target creature this turn.",
    },
  ],
});
