import { defineCard } from "../define.js";

export default defineCard({
  name: "Carnassid",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\n{1}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{G}: Regenerate this creature.",
    },
  ],
});
