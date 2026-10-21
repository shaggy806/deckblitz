import { defineCard } from "../define.js";

// Theros Beyond Death. Wavebreak Hippocamp's "your first spell during each
// opponent's turn"; one scry however many opponents are dealt damage.

const TEXT =
  "Whenever you cast your first spell during each opponent's turn, this creature deals 1 damage to each opponent. Scry 1.";

export default defineCard({
  name: "Mischievous Chimera",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment", "creature"],
  subtypes: ["Chimera"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
