import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 28823.

export default defineCard({
  name: "Ethereal Champion",
  manaCost: "{2}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 3,
  toughness: 4,
  text: "Pay 1 life: Prevent the next 1 damage that would be dealt to this creature this turn.",
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 1 },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: 1 },
      resolve: null,
      text: "Pay 1 life: Prevent the next 1 damage that would be dealt to this creature this turn.",
    },
  ],
});
