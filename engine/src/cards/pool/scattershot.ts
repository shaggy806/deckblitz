import { defineCard } from "../define.js";

export default defineCard({
  name: "Scattershot",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Scattershot deals 1 damage to target creature.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
  targets: ["creature"],
  effect: { kind: "damage", amount: 1, target: 0 },
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
