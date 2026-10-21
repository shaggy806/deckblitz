import { defineCard } from "../define.js";

// EDHREC rank 14012.
//
// The fliers are counted as the spell resolves, after the destroy.
//
// Rulings:
//   [2019-07-12] If the target creature is an illegal target by the time Aerial Assault tries to
//     resolve, the spell doesn't resolve. You won't gain life. If the target is legal but is not
//     destroyed (most likely because it has indestructible), you will gain life.

export default defineCard({
  name: "Aerial Assault",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy target tapped creature. You gain 1 life for each creature you control with flying.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you", keyword: "flying" } } },
    ],
  },
});
