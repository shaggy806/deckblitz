import { defineCard } from "../define.js";

// EDHREC rank 24182.

export default defineCard({
  name: "Rune of Protection: Red",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  cycling: { cost: "{2}" },
  text: "{W}: The next time a red source of your choice would deal damage to you this turn, prevent that damage.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { colors: ["R"] },
        to: "you",
        amount: "next-time",
      },
      resolve: null,
      text: "{W}: The next time a red source of your choice would deal damage to you this turn, prevent that damage.",
    },
  ],
});
