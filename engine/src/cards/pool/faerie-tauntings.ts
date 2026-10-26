import { defineCard } from "../define.js";

// One choice for all opponents (the ruling): a single `may` around an
// each-opponent life loss.
export default defineCard({
  name: "Faerie Tauntings",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["kindred", "enchantment"],
  subtypes: ["Faerie"],
  text: "Whenever you cast a spell during an opponent's turn, you may have each opponent lose 1 life.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have each opponent lose 1 life?",
        effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      },
      resolve: null,
      text: "Whenever you cast a spell during an opponent's turn, you may have each opponent lose 1 life.",
    },
  ],
});
