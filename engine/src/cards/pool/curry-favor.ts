import { defineCard } from "../define.js";

// The Adventure half of Smitten Swordmaster // Curry Favor (rule 715). X is
// read as it resolves; both halves read the same board, nothing changing it
// between them.

const KNIGHTS = { countOf: { subtype: "Knight", controlledBy: "you" } } as const;

export default defineCard({
  name: "Curry Favor",
  art: "https://cards.scryfall.io/art_crop/back/1/c/1cd477f5-53e9-446a-b717-5796d87672ba.jpg",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "You gain X life and each opponent loses X life, where X is the number of Knights you control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: KNIGHTS },
      { kind: "lose-life", amount: KNIGHTS, who: "each-opponent" },
    ],
  },
  faces: ["Smitten Swordmaster", "Curry Favor"],
  adventure: true,
});
