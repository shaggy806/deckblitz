import { defineCard } from "../define.js";

// EDHREC rank 19558.
//
// Rulings:
//   [2019-06-14] The copies String of Disappearances creates are created on the stack, so they're
//     not cast.
//   [2019-06-14] While resolving String of Disappearances, you can't pay {U}{U} multiple times to
//     copy it multiple times.
//   [2019-06-14] The copy of String of Disappearances has the ability to copy itself.
//   [2019-06-14] If the target creature is an illegal target by the time String of Disappearances
//     tries to resolve, the spell doesn't resolve. That creature's controller can't pay to copy it.
//
// Chain of Vapor's shape with {U}{U} for the land: "that creature's controller"
// is whoever controlled it as it left (rule 608.2h); the copy is theirs.

export default defineCard({
  name: "String of Disappearances",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. Then that creature's controller may pay {U}{U}. If the player does, they may copy this spell and may choose a new target for that copy.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        options: [{ pay: "{U}{U}", text: "Pay {U}{U}" }],
        ifDid: {
          kind: "each-player-may",
          who: "that-player",
          prompt: "Copy String of Disappearances? (You may choose a new target for the copy.)",
          effect: { kind: "copy-spell", target: "source", newTargets: true },
        },
      },
    ],
  },
});
