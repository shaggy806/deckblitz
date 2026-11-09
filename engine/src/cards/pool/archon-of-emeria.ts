import { defineCard } from "../define.js";

// The cast limit counts the whole turn, spells cast before Archon arrived
// included (its rulings).

export default defineCard({
  name: "Archon of Emeria",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nEach player can't cast more than one spell each turn.\nNonbasic lands your opponents control enter tapped.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "each-player", limit: 1 }],
      text: "Each player can't cast more than one spell each turn.",
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "land", notSupertype: "basic", controlledBy: "opponent" },
        tapped: true,
      },
      text: "Nonbasic lands your opponents control enter tapped.",
    },
  ],
});
