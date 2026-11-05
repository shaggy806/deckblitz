import { defineCard } from "../define.js";

// EDHREC rank 29841.

export default defineCard({
  name: "Planeswalker's Mirth",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{3}{W}: Target opponent reveals a card at random from their hand. You gain life equal to that card's mana value.",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "choose-random-card",
        zone: "hand",
        whose: 0,
        show: "reveal",
        slot: 1,
        then: { kind: "gain-life", amount: { manaValueOf: 1 } },
      },
      resolve: null,
      text: "{3}{W}: Target opponent reveals a card at random from their hand. You gain life equal to that card's mana value.",
    },
  ],
});
