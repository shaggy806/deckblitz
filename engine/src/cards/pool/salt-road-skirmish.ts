import { defineCard } from "../define.js";

// EDHREC rank 15925.
//
// Rulings:
//   [2025-04-04] If the target creature is an illegal target at the time Salt Road Skirmish tries
//     to resolve, it won't resolve and none of its effects will happen. However, if the target is
//     still legal and the target isn't destroyed (most likely because it has indestructible), you
//     will still create two Warrior tokens.

export default defineCard({
  name: "Salt Road Skirmish",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. Create two 1/1 red Warrior creature tokens. They gain haste until end of turn. Sacrifice them at the beginning of the next end step.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "create-token",
        token: "Red Warrior Token",
        count: 2,
        gainUntilEndOfTurn: ["haste"],
        sacrificeAtEndStep: true,
      },
    ],
  },
});
