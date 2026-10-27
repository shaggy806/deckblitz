import { defineCard } from "../define.js";

export default defineCard({
  name: "Floating-Dream Zubera",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zubera", "Spirit"],
  power: 1,
  toughness: 2,
  text: "When this creature dies, draw a card for each Zubera that died this turn.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { turnHistory: "died", who: "each-player", filter: { subtype: "Zubera" } } },
      resolve: null,
      text: "When this creature dies, draw a card for each Zubera that died this turn.",
    },
  ],
});
