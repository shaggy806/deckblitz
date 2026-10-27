import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 29449.

const TEXT = "{U}, {T}, Discard a card: Target creature gains flying until end of turn.";

export default defineCard({
  name: "Balloon Peddler",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
