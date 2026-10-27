import { defineCard } from "../define.js";

// EDHREC rank 4093.

export default defineCard({
  name: "Pentad Prism",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)\nRemove a charge counter from this artifact: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "Remove a charge counter from this artifact: Add one mana of any color.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)",
    },
  ],
});
