import { defineCard } from "../define.js";

export default defineCard({
  name: "Relic Crush",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact or enchantment and up to one other target artifact or enchantment.",
  targets: [
    "artifact-or-enchantment",
    { kind: "optional", of: { kind: "other", of: "artifact-or-enchantment", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "destroy", target: 1 },
    ],
  },
});
