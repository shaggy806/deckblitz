import { defineCard } from "../define.js";

export default defineCard({
  name: "Mischievous Poltergeist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nPay 1 life: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 1 },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Pay 1 life: Regenerate this creature.",
    },
  ],
});
