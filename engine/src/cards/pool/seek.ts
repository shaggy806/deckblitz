import { defineCard } from "../define.js";

const FACES = ["Hide // Seek", "Hide", "Seek"];

// The right half of Hide // Seek (see hide-seek.ts). "A card", a quantity,
// must be found (rule 701.23d); "its mana value" is the exiled card's, read
// in exile — a split card's both halves together (rule 709.4).
export default defineCard({
  name: "Seek",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Search target opponent's library for a card and exile it. You gain life equal to its mana value. Then that player shuffles.",
  targets: ["opponent"],
  effect: {
    kind: "search-library",
    whose: { target: 0 },
    filter: {},
    destination: "exile",
    min: 1,
    max: 1,
    then: { kind: "gain-life", amount: { manaValueOf: 0 } },
  },
  faces: FACES,
  split: true,
});
