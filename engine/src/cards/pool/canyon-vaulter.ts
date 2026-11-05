import { defineCard } from "../define.js";

// EDHREC rank 14345.

export default defineCard({
  name: "Canyon Vaulter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Pilot"],
  power: 3,
  toughness: 1,
  text: "Whenever this creature saddles a Mount or crews a Vehicle during your main phase, that Mount or Vehicle gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "crews-or-saddles", who: "self", as: ["crew", "saddle"] },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "trigger-object",
        keyword: "flying",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature saddles a Mount or crews a Vehicle during your main phase, that Mount or Vehicle gains flying until end of turn.",
      condition: {
        kind: "all",
        of: [
          { kind: "your-turn" },
          { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
        ],
      },
    },
  ],
});
