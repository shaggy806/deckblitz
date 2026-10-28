import { defineCard } from "../define.js";

// The back face of Poppet Stitcher. Its tokens lose decayed with the rest (layer 6),
// so they can block; base 3/3 in layer 7b.

const STATIC_TEXT = "Creature tokens you control lose all abilities and have base power and toughness 3/3.";

export default defineCard({
  name: "Poppet Factory",
  art: "https://cards.scryfall.io/art_crop/back/9/9/999038b3-7d64-4554-b341-0675d4af8d8b.jpg",
  colors: ["U"],
  types: ["artifact"],
  text: `${STATIC_TEXT}\nAt the beginning of your upkeep, you may transform this artifact.`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true, controlledBy: "you" } },
      loseAllAbilities: true,
      setBasePt: { power: 3, toughness: 3 },
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Transform Poppet Factory?",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may transform this artifact.",
    },
  ],
  faces: ["Poppet Stitcher", "Poppet Factory"],
  transform: true,
});
