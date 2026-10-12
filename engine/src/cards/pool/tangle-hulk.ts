import { defineCard } from "../define.js";

export default defineCard({
  name: "Tangle Hulk",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 5,
  toughness: 3,
  text: "{2}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}{G}: Regenerate this creature.",
    },
  ],
});
