import { defineCard } from "../define.js";

// Kindred is a card type, so "number of card types among cards in all
// graveyards" counts it (`cardTypesInGraveyard`, rule 205.2a). "Attacks alone"
// is the declared attack (the ruling), `attacks-alone`.
export default defineCard({
  name: "Altar of the Goyf",
  manaCost: "{5}",
  colors: [],
  types: ["kindred", "artifact"],
  subtypes: ["Lhurgoyf"],
  text: "Whenever a creature you control attacks alone, it gets +X/+X until end of turn, where X is the number of card types among cards in all graveyards.\nLhurgoyf creatures you control have trample.",
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: { cardTypesInGraveyard: {} },
        toughness: { cardTypesInGraveyard: {} },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever a creature you control attacks alone, it gets +X/+X until end of turn, where X is the number of card types among cards in all graveyards.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Lhurgoyf" },
      grantKeywords: ["trample"],
      text: "Lhurgoyf creatures you control have trample.",
    },
  ],
});
