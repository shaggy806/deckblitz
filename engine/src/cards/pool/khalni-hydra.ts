import { defineCard } from "../define.js";

export default defineCard({
  name: "Khalni Hydra",
  manaCost: "{G}{G}{G}{G}{G}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceColored: "{G}",
    reduceColoredTimes: { countOf: { type: "creature", colors: ["G"], controlledBy: "you" } },
  },
  text: "This spell costs {G} less to cast for each green creature you control.\nTrample",
});
