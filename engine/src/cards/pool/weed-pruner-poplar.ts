import { defineCard } from "../define.js";

// EDHREC rank 26726. Morningtide.
//
// Rulings:
//   [2008-04-01] The ability is mandatory. If you’re the only player who controls any other
//     creatures, you must target one of your own creatures with the ability.
const TEXT = "At the beginning of your upkeep, target creature other than this creature gets -1/-1 until end of turn.";

export default defineCard({
  name: "Weed-Pruner Poplar",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Treefolk", "Assassin"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
