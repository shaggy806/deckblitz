import { defineCard } from "../define.js";

// EDHREC rank 27351.

const TEXT = "Heroic — Whenever you cast a spell that targets this creature, you gain 2 life.";

export default defineCard({
  name: "Setessan Battle Priest",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
