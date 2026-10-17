import { defineCard } from "../define.js";

export default defineCard({
  name: "All of History, All at Once",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Time travel. (For each suspended card you own and each permanent you control with a time counter on it, you may add or remove a time counter.)\nStorm (When you cast this spell, copy it for each spell cast before it this turn.)",
  effect: { kind: "time-travel" },
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
