import { defineCard } from "../define.js";

// EDHREC rank 24723.

export default defineCard({
  name: "Rune of Protection: Green",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  cycling: { cost: "{2}" },
  text: "{W}: The next time a green source of your choice would deal damage to you this turn, prevent that damage.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { colors: ["G"] },
        to: "you",
        amount: "next-time",
      },
      resolve: null,
      text: "{W}: The next time a green source of your choice would deal damage to you this turn, prevent that damage.",
    },
  ],
});
