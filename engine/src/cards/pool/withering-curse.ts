import { defineCard } from "../define.js";

// EDHREC rank 9924.

// Infusion is checked as the spell resolves: life gained earlier this turn,
// by you, turns the -2/-2 into a wrath.
export default defineCard({
  name: "Withering Curse",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All creatures get -2/-2 until end of turn.\nInfusion — If you gained life this turn, destroy all creatures instead.",
  effect: {
    kind: "conditional",
    condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
    then: { kind: "destroy-all", filter: { type: "creature" } },
    else: { kind: "modify-pt-all", filter: { type: "creature" }, power: -2, toughness: -2, duration: "end-of-turn" },
  },
});
