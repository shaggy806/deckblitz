import { defineCard } from "../define.js";

// EDHREC rank 24197.

export default defineCard({
  name: "Mjölnir's Might",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Mjölnir's Might deals 4 damage to target player.\nExile the top card of your library. Until the end of your next turn, you may play that card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
    ],
  },
});
