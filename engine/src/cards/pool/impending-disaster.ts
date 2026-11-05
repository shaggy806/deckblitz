import { defineCard } from "../define.js";

const TEXT = "At the beginning of your upkeep, if there are seven or more lands on the battlefield, sacrifice this enchantment and destroy all lands.";

export default defineCard({
  name: "Impending Disaster",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 7, anyController: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "sacrifice-source" }, { kind: "destroy-all", filter: { type: "land" } }],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
