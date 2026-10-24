import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 27917.
export default defineCard({
  name: "Take Down",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Choose one —\n" +
    "• Take Down deals 4 damage to target creature with flying.\n" +
    "• Take Down deals 1 damage to each creature with flying.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Take Down deals 4 damage to target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      {
        text: "Take Down deals 1 damage to each creature with flying.",
        targets: [],
        effect: { kind: "damage-all", amount: 1, filter: { type: "creature", keyword: "flying" } },
      },
    ],
  },
});
