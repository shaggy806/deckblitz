import { defineCard } from "../define.js";

const TEXT = "Whenever a creature dies, that creature's controller sacrifices a land of their choice.";

export default defineCard({
  name: "Burning Sands",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-controller", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
