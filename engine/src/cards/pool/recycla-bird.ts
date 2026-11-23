import { defineCard } from "../define.js";

export default defineCard({
  name: "Recycla-bird",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen Recycla-bird dies, put a flying counter on target creature you control.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
      resolve: null,
      text: "When Recycla-bird dies, put a flying counter on target creature you control.",
    },
  ],
});
