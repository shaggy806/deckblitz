import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 30599. Plague Witch's shape.

const TEXT = "{G}, {T}, Discard a card: Target creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Deepwood Drummer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
