import { defineCard } from "../define.js";

// Ascend on an instant: checked as it resolves (rule 702.131b). The ruling: the
// player whose turn it is chooses first, then each other opponent in turn
// order, knowing the choices before theirs, and all the chosen creatures are
// sacrificed at the same time (rule 101.4), as `sacrifice`'s `who` does.
const TEXT =
  "Each opponent sacrifices a creature of their choice. If you have the city's blessing, instead each opponent sacrifices half the creatures they control of their choice, rounded up.";

export default defineCard({
  name: "Vona's Hunger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  keywords: ["ascend"],
  text: `Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${TEXT}`,
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "citys-blessing" },
    then: {
      kind: "sacrifice",
      who: "each-opponent",
      filter: { type: "creature" },
      count: {
        half: { countOf: { type: "creature", controlledBy: "you" }, forEachPlayer: true },
        round: "up",
      },
    },
    else: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
  },
});
