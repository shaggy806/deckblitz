import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 25558.

const TEXT = "{2}{B}, {T}, Discard a card: Destroy target nonblack creature. It can't be regenerated.";

export default defineCard({
  name: "Notorious Assassin",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper", "Assassin"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true, discard: { count: 1 } },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
