import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 18042. Compassionate Healer's trigger,
// word for word: it doesn't tap the creature — attacking or another cost does
// (the ruling).
const TAPPED_TEXT = "Whenever this creature becomes tapped, you gain 1 life and scry 1.";

export default defineCard({
  name: "Samite Herbalist",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: `${TAPPED_TEXT} (Look at the top card of your library. You may put that card on the bottom.)`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: TAPPED_TEXT,
    },
  ],
});
