import { defineCard } from "../define.js";

// EDHREC rank 14183.

export default defineCard({
  name: "Righteous Aura",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{W}, Pay 2 life: The next time a source of your choice would deal damage to you this turn, prevent that damage.",
  activated: [
    {
      cost: { mana: "{W}", tap: false, payLife: 2 },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "next-time" },
      resolve: null,
      text: "{W}, Pay 2 life: The next time a source of your choice would deal damage to you this turn, prevent that damage.",
    },
  ],
});
