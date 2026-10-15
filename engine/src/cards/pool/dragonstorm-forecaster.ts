import { defineCard } from "../define.js";

// EDHREC rank 20234.
const TEXT =
  "{2}, {T}: Search your library for a card named Dragonstorm Globe or Boulderborn Dragon, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Dragonstorm Forecaster",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 0,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { anyOf: [{ name: "Dragonstorm Globe" }, { name: "Boulderborn Dragon" }] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
