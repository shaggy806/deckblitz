import { defineCard } from "../define.js";

export default defineCard({
  name: "Astral Steel",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +1/+2 until end of turn.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 1, toughness: 2, duration: "end-of-turn" },
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
