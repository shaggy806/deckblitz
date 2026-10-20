import { defineCard } from "../define.js";

export default defineCard({
  name: "Shadewing Laureate",
  manaCost: "{W}{W/B}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever another creature you control with flying dies, put a +1/+1 counter on target creature you control.",
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", keyword: "flying" },
        otherOnly: true,
      },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever another creature you control with flying dies, put a +1/+1 counter on target creature you control.",
    },
  ],
});
