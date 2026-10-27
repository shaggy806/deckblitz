import { defineCard } from "../define.js";

const UPKEEP = "At the beginning of your upkeep, sacrifice this creature unless you sacrifice a Mountain.";

export default defineCard({
  name: "Lithophage",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 7,
  toughness: 7,
  text: UPKEEP,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land", subtype: "Mountain" }, text: "Sacrifice a Mountain" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
