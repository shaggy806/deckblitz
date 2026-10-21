import { defineCard } from "../define.js";

// Top-5000 #1304.

export default defineCard({
  name: "Tendershoot Dryad",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 2,
  toughness: 2,
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nAt the beginning of each upkeep, create a 1/1 green Saproling creature token.\nSaprolings you control get +2/+2 as long as you have the city's blessing.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      text: "At the beginning of each upkeep, create a 1/1 green Saproling creature token.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Saproling", controlledBy: "you" } },
      condition: { kind: "citys-blessing" },
      grantPt: [2, 2],
      text: "Saprolings you control get +2/+2 as long as you have the city's blessing.",
    },
  ],
});
