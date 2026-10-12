import { defineCard } from "../define.js";

export default defineCard({
  name: "Oasis",
  colors: [],
  types: ["land"],
  text: "{T}: Prevent the next 1 damage that would be dealt to target creature this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{T}: Prevent the next 1 damage that would be dealt to target creature this turn.",
    },
  ],
});
