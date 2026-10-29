import { defineCard } from "../define.js";

// EDHREC rank 31274.

export default defineCard({
  name: "Safeguard",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{2}{W}: Prevent all combat damage that would be dealt by target creature this turn.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
      resolve: null,
      text: "{2}{W}: Prevent all combat damage that would be dealt by target creature this turn.",
    },
  ],
});
