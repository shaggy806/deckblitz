import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 16736.

const TEXT = "{G}, {T}, Discard a card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Greenseeker",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "search-library", filter: { supertype: "basic", type: "land" }, destination: "hand", min: 0, max: 1, reveal: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
