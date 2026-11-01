import { defineCard } from "../define.js";

// The card stays in its owner's hand, its mana value read there (slot 1,
// beside the player in slot 0). An empty hand reveals nothing and deals
// nothing.
const TEXT =
  "{3}{R}: Target opponent reveals a card at random from their hand. This enchantment deals damage equal to that card's mana value to that player. Activate only as a sorcery.";

export default defineCard({
  name: "Planeswalker's Fury",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      sorcerySpeed: true,
      targets: ["opponent"],
      effect: {
        kind: "choose-random-card",
        zone: "hand",
        whose: 0,
        show: "reveal",
        slot: 1,
        then: { kind: "damage", target: 0, amount: { manaValueOf: 1 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
