import { defineCard } from "../define.js";

export default defineCard({
  name: "Jhoira's Toolbox",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: "{2}: Regenerate target artifact creature.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{2}: Regenerate target artifact creature.",
    },
  ],
});
