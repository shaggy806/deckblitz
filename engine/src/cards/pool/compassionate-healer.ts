import { defineCard } from "../define.js";

// EDHREC rank 11971. Wakandan Tusker's trigger, word for word.
//
// Rulings:
//   [2025-10-02] Compassionate Healer's triggered ability doesn't allow you to tap Compassionate
//     Healer. You have to find some other way to tap it, such as paying a waterbend cost or
//     attacking.

const TAPPED_TEXT = "Whenever this creature becomes tapped, you gain 1 life and scry 1.";

export default defineCard({
  name: "Compassionate Healer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Ally"],
  power: 2,
  toughness: 2,
  text: `${TAPPED_TEXT} (Look at the top card of your library. You may put it on the bottom.)`,
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
