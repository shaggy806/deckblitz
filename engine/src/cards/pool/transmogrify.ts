import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] If the player reveals their entire library without revealing a creature card,
//     that player just shuffles their library.
//   [2020-06-23] If the target creature is an illegal target by the time Transmogrify tries to
//     resolve, the spell won't resolve. No player reveals cards or shuffles their library.

export default defineCard({
  name: "Transmogrify",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Exile target creature. That creature's controller reveals cards from the top of their library until they reveal a creature card. That player puts that card onto the battlefield, then shuffles the rest into their library.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "reveal-until",
        whose: { controllerOfTarget: 0 },
        filter: { type: "creature" },
        put: "battlefield",
        rest: "shuffle",
      },
    ],
  },
});
