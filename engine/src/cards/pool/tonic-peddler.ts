import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 30682. Mournful Zombie's shape behind a
// Spellshaper's cost.

const TEXT = "{W}, {T}, Discard a card: Target player gains 3 life.";

export default defineCard({
  name: "Tonic Peddler",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true, discard: { count: 1 } },
      targets: ["player"],
      effect: { kind: "gain-life", amount: 3, toControllerOfTarget: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
