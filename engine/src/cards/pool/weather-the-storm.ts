import { defineCard } from "../define.js";

export default defineCard({
  name: "Weather the Storm",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You gain 3 life.\nStorm (When you cast this spell, copy it for each spell cast before it this turn.)",
  effect: { kind: "gain-life", amount: 3 },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
});
