import { defineCard } from "../define.js";

// EDHREC rank 30102.

const SEEK_TEXT = "Seek out — Whenever you draw your second card each turn, you gain 4 life.";

export default defineCard({
  name: "Dr. Pulaski, Cynical Clinician",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 2,
  toughness: 2,
  text: SEEK_TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: SEEK_TEXT,
    },
  ],
});
