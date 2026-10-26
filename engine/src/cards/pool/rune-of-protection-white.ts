import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 21459.

export default defineCard({
  name: "Rune of Protection: White",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  cycling: { cost: "{2}" },
  text: "{W}: The next time a white source of your choice would deal damage to you this turn, prevent that damage.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { colors: ["W"] },
        to: "you",
        amount: "next-time",
      },
      resolve: null,
      text: "{W}: The next time a white source of your choice would deal damage to you this turn, prevent that damage.",
    },
  ],
});
