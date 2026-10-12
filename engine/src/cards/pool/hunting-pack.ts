import { defineCard } from "../define.js";

export default defineCard({
  name: "Hunting Pack",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Create a 4/4 green Beast creature token.\nStorm (When you cast this spell, copy it for each spell cast before it this turn.)",
  effect: { kind: "create-token", token: "Beast Token", count: 1 },
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
