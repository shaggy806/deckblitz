import { defineCard } from "../define.js";

export default defineCard({
  name: "Rusted Slasher",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 4,
  toughness: 1,
  text: "Sacrifice an artifact: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Sacrifice an artifact: Regenerate this creature.",
    },
  ],
});
