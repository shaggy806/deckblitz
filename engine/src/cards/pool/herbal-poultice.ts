import { defineCard } from "../define.js";

export default defineCard({
  name: "Herbal Poultice",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: "{3}, Sacrifice this artifact: Regenerate target creature.",
  activated: [
    {
      cost: { mana: "{3}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{3}, Sacrifice this artifact: Regenerate target creature.",
    },
  ],
});
