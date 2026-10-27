import { defineCard } from "../define.js";

export default defineCard({
  name: "Silent-Chant Zubera",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Zubera", "Spirit"],
  power: 1,
  toughness: 2,
  text: "When this creature dies, you gain 2 life for each Zubera that died this turn.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { product: [2, { turnHistory: "died", who: "each-player", filter: { subtype: "Zubera" } }] } },
      resolve: null,
      text: "When this creature dies, you gain 2 life for each Zubera that died this turn.",
    },
  ],
});
