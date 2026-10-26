import { defineCard } from "../define.js";

export default defineCard({
  name: "Mayor of Avabruck",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Advisor", "Werewolf"],
  power: 1,
  toughness: 1,
  text: "Other Human creatures you control get +1/+1.\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", none: true },
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Human" },
      grantPt: [1, 1],
      text: "Other Human creatures you control get +1/+1.",
    },
  ],
  faces: ["Mayor of Avabruck", "Howlpack Alpha"],
  transform: true,
});
