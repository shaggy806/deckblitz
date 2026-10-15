import { defineCard } from "../define.js";

// EDHREC rank 14763.
// Rulings:
//   [2025-06-06] If the target creature is an illegal target as Deadly Embrace tries to resolve,
//     it won't resolve and none of its effects will happen. You won't draw cards.

export default defineCard({
  name: "Deadly Embrace",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature an opponent controls. Then draw a card for each creature that died this turn.",
  targets: ["creature-an-opponent-controls"],
  // Every creature that died this turn, whoever controlled it — the one just
  // destroyed included (Spymaster's Vault's count).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "draw", amount: { creaturesDiedThisTurn: true, anyController: true } },
    ],
  },
});
