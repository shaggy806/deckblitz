import { defineCard } from "../define.js";

const TEXT = "When this creature dies, destroy all permanents at the beginning of the next end step.";

// The delayed ability destroys whatever is on the battlefield when it
// resolves, not what was there when the Giant died (the ruling).
export default defineCard({
  name: "Bearer of the Heavens",
  manaCost: "{7}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 10,
  toughness: 10,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        text: "Destroy all permanents.",
        effect: { kind: "destroy-all", filter: {} },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
