import { defineCard } from "../define.js";

export default defineCard({
  name: "Implements of Sacrifice",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{1}, {T}, Sacrifice this artifact: Add two mana of any one color.",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 2 },
      resolve: null,
      text: "{1}, {T}, Sacrifice this artifact: Add two mana of any one color.",
    },
  ],
});
