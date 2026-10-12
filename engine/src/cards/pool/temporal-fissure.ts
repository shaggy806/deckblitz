import { defineCard } from "../define.js";

export default defineCard({
  name: "Temporal Fissure",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return target permanent to its owner's hand.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
  targets: ["permanent"],
  effect: { kind: "return-to-hand", target: 0 },
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
