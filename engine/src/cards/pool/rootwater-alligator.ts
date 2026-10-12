import { defineCard } from "../define.js";

export default defineCard({
  name: "Rootwater Alligator",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Crocodile"],
  power: 3,
  toughness: 2,
  text: "Sacrifice a Forest: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Forest" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Sacrifice a Forest: Regenerate this creature.",
    },
  ],
});
