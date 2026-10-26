import { defineCard } from "../define.js";

// EDHREC rank 29924.
//
// Rulings:
//   [2013-09-15] Peak Eruption can target any land with the subtype Mountain, not just those named
//     Mountain. It can't target a land that doesn't have that subtype, even if the land can tap
//     for {R}.
//   [2013-09-15] If the target Mountain is an illegal target when Peak Eruption tries to resolve,
//     it won't resolve and none of its effects will happen. No damage will be dealt. However, if
//     Peak Eruption resolves and the Mountain isn't destroyed (perhaps because it has
//     indestructible), damage will be dealt.
// The damage reads the land's controller through its last-known information once it's gone.

export default defineCard({
  name: "Peak Eruption",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target Mountain. Peak Eruption deals 3 damage to that land's controller.",
  targets: [{ kind: "permanent", filter: { subtype: "Mountain" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 3, toControllerOfTarget: 0 },
    ],
  },
});
