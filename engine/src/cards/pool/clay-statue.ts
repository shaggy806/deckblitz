import { defineCard } from "../define.js";

export default defineCard({
  name: "Clay Statue",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 1,
  text: "{2}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}: Regenerate this creature.",
    },
  ],
});
