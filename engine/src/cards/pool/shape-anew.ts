import { defineCard } from "../define.js";

// EDHREC rank 22755.
//
// Polymorph's shape with "its controller sacrifices it" in place of the
// destroy: the reveal reads the sacrificed artifact's controller through its
// last-known information, and still happens when the sacrifice can't (the
// rulings). The found artifact enters under the revealing player's control;
// the rest are shuffled back, and the library is shuffled even when the first
// card was the artifact.
//
// Rulings:
//   [2011-01-01] If there are no artifact cards in the player's library, all the cards in that
//     library are revealed, then the library is shuffled. (The targeted artifact remains
//     sacrificed.)
//   [2011-01-01] If the targeted artifact's controller can't sacrifice it (due to Tajuru
//     Preserver, perhaps), the other effects of the spell will still happen.

export default defineCard({
  name: "Shape Anew",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "The controller of target artifact sacrifices it, then reveals cards from the top of their library until they reveal an artifact card. That player puts that card onto the battlefield, then shuffles all other cards revealed this way into their library.",
  targets: ["artifact"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice-target", target: 0, byItsController: true },
      {
        kind: "reveal-until",
        whose: { controllerOfTarget: 0 },
        filter: { type: "artifact" },
        put: "battlefield",
        rest: "shuffle",
      },
    ],
  },
});
