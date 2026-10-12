import { defineCard } from "../define.js";

export default defineCard({
  name: "Votary of the Conclave",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
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
