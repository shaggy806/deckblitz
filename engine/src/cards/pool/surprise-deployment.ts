import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 29102.
//
// Rulings:
//   [2007-05-01] Putting the card onto the battlefield is optional. When the ability resolves, you
//     can choose not to.
//
// Ilharg, the Raze-Boar's shape: up to one nonwhite creature card from your
// hand, and a delayed return on exactly that permanent — one that left the
// battlefield before the end step stays where it went (rule 400.7).

export default defineCard({
  name: "Surprise Deployment",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during combat.\nYou may put a nonwhite creature card from your hand onto the battlefield. At the beginning of the next end step, return that creature to your hand. (Return it only if it's on the battlefield.)",
  castOnlyIf: { kind: "turn-structure", duringCombat: true },
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "hand",
    min: 0,
    max: 1,
    destination: "battlefield",
    leftover: "stay",
    filter: { type: "creature", notColors: ["W"] },
    then: {
      kind: "delayed-trigger",
      at: "next-end-step",
      effect: { kind: "return-to-hand", target: 0 },
      text: "Return the creature Surprise Deployment put onto the battlefield to your hand.",
    },
  },
});
