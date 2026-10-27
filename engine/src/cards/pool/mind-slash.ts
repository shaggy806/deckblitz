import { defineCard } from "../define.js";

// EDHREC rank 16060.

const TEXT =
  "{B}, Sacrifice a creature: Target opponent reveals their hand. You choose a card from it. That player discards that card. Activate only as a sorcery.";

export default defineCard({
  name: "Mind Slash",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "creature-you-control" },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0 },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
