import { defineCard } from "../define.js";

// Ascend on a sorcery is applied by the engine as its first instruction
// (rule 702.131a), so a tenth permanent's blessing counts here. Ruling: only
// creatures on the battlefield as it resolves get -2/-2.
export default defineCard({
  name: "Golden Demise",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nAll creatures get -2/-2 until end of turn. If you have the city's blessing, instead only creatures your opponents control get -2/-2 until end of turn.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "citys-blessing" },
    then: {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "opponent" },
      power: -2,
      toughness: -2,
      duration: "end-of-turn",
    },
    else: { kind: "modify-pt-all", filter: { type: "creature" }, power: -2, toughness: -2, duration: "end-of-turn" },
  },
});
