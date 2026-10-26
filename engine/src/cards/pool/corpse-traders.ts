import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 25982.
//
// Rulings:
//   [2012-05-01] You can sacrifice Corpse Traders to pay the cost of its ability.

const TEXT =
  "{2}{B}, Sacrifice a creature: Target opponent reveals their hand. You choose a card from it. That player discards that card. Activate only as a sorcery.";

export default defineCard({
  name: "Corpse Traders",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0 },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
