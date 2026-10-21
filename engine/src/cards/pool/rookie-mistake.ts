import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 28484.
//
// Rulings:
//   [2020-06-23] You can't cast Rookie Mistake unless you choose two creatures as targets.
//   [2020-06-23] If one target creature becomes an illegal target before Rookie Mistake resolves,
//     the other is affected as appropriate.

export default defineCard({
  name: "Rookie Mistake",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target creature gets +0/+2 and another target creature gets -2/-0.",
  targets: distinctTargets(2, "creature"),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: -2, toughness: 0, duration: "end-of-turn" },
    ],
  },
});
