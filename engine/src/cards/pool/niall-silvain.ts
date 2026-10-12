import { defineCard } from "../define.js";

export default defineCard({
  name: "Niall Silvain",
  manaCost: "{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 2,
  toughness: 2,
  text: "{G}{G}{G}{G}, {T}: Regenerate target creature.",
  activated: [
    {
      cost: { mana: "{G}{G}{G}{G}", tap: true },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{G}{G}{G}{G}, {T}: Regenerate target creature.",
    },
  ],
});
