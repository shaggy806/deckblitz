import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 26504. Thalakos Drifters' ability.

const TEXT = "Discard a card: This creature gains shadow until end of turn.";

export default defineCard({
  name: "Trespasser il-Vec",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 1,
  text: `${TEXT} (It can block or be blocked by only creatures with shadow.)`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "shadow", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
