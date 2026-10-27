import { defineCard } from "../define.js";

// EDHREC rank 13601.

export default defineCard({
  name: "Gemstone Array",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{2}: Put a charge counter on this artifact.\nRemove a charge counter from this artifact: Add one mana of any color.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{2}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "Remove a charge counter from this artifact: Add one mana of any color.",
    },
  ],
});
