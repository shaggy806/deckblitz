import { defineCard } from "../define.js";

export default defineCard({
  name: "Volcanic Awakening",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
  targets: ["land"],
  effect: { kind: "destroy", target: 0 },
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
