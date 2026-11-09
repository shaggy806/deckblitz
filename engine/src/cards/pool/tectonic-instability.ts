import { defineCard } from "../define.js";

const TEXT = "Whenever a land enters, tap all lands its controller controls.";

export default defineCard({
  name: "Tectonic Instability",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "land" } },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "land", controlledByRef: { controllerOf: "trigger-object" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
