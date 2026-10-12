import { defineCard } from "../define.js";

export default defineCard({
  name: "Diabolic Machine",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  text: "{3}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{3}: Regenerate this creature.",
    },
  ],
});
