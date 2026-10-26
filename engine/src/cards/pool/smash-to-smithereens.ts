import { defineCard } from "../define.js";

// EDHREC rank 12715.
//
// Rulings:
//   [2015-06-22] Smash to Smithereens targets only the artifact, not any player. If that artifact
//     becomes an illegal target by the time Smash to Smithereens tries to resolve, Smash to
//     Smithereens won't resolve and none of its effects will happen. No damage will be dealt.

export default defineCard({
  name: "Smash to Smithereens",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy target artifact. Smash to Smithereens deals 3 damage to that artifact's controller.",
  targets: ["artifact"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 3, toControllerOfTarget: 0 },
    ],
  },
});
