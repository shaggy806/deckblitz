import { defineCard } from "../define.js";

export default defineCard({
  name: "Folk of An-Havva",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature blocks, it gets +2/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature blocks, it gets +2/+0 until end of turn.",
    },
  ],
});
