import { defineCard } from "../define.js";

export default defineCard({
  name: "Marrow Bats",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat", "Skeleton"],
  power: 4,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nPay 4 life: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 4 },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Pay 4 life: Regenerate this creature.",
    },
  ],
});
