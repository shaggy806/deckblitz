import { defineCard } from "../define.js";

export default defineCard({
  name: "Soldevi Steam Beast",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 2,
  text: "Whenever this creature becomes tapped, target opponent gains 2 life.\n{2}: Regenerate this creature.",
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: ["opponent"],
      effect: { kind: "gain-life", amount: 2, toControllerOfTarget: 0 },
      resolve: null,
      text: "Whenever this creature becomes tapped, target opponent gains 2 life.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}: Regenerate this creature.",
    },
  ],
});
