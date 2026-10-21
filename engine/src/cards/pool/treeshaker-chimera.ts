import { defineCard } from "../define.js";

export default defineCard({
  name: "Treeshaker Chimera",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Chimera"],
  power: 8,
  toughness: 5,
  text: "All creatures able to block this creature do so.\nWhen this creature dies, draw three cards.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: "When this creature dies, draw three cards.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked"],
      text: "All creatures able to block this creature do so.",
    },
  ],
});
