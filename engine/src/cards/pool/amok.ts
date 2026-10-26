import { defineCard } from "../define.js";

export default defineCard({
  name: "Amok",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "{1}, Discard a card at random: Put a +1/+1 counter on target creature.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, discard: { count: 1, random: true } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}, Discard a card at random: Put a +1/+1 counter on target creature.",
    },
  ],
});
