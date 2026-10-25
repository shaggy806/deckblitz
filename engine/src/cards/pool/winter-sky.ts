import { defineCard } from "../define.js";

// Homelands. EDHREC rank 17546.
export default defineCard({
  name: "Winter Sky",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Flip a coin. If you win the flip, Winter Sky deals 1 damage to each creature and each player. If you lose the flip, each player draws a card.",
  effect: {
    kind: "flip-coin",
    won: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
        { kind: "damage", amount: 1, who: "each-player" },
      ],
    },
    lost: { kind: "draw", amount: 1, who: "each-player" },
  },
});
