import { defineCard } from "../define.js";

// EDHREC rank 24483. Ascend on an instant is its first instruction as it
// resolves (rule 702.131a), so the blessing it gives counts for its own pump;
// the creatures are the ones you control as it resolves (its ruling).

export default defineCard({
  name: "Pride of Conquerors",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nCreatures you control get +1/+1 until end of turn. If you have the city's blessing, those creatures get +2/+2 until end of turn instead.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "citys-blessing" },
    then: {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "you" },
      power: 2,
      toughness: 2,
      duration: "end-of-turn",
    },
    else: {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "you" },
      power: 1,
      toughness: 1,
      duration: "end-of-turn",
    },
  },
});
