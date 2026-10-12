import { defineCard } from "../define.js";

export default defineCard({
  name: "Deepwood Ghoul",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  text: "Pay 2 life: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 2 },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Pay 2 life: Regenerate this creature.",
    },
  ],
});
