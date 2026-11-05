import { defineCard } from "../define.js";

// EDHREC rank 20939.

export default defineCard({
  name: "Myr Adapter",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 1,
  toughness: 1,
  text: "This creature gets +1/+1 for each Equipment attached to it.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Equipment", attachedTo: { isSource: true } }, pt: [1, 1] },
      text: "This creature gets +1/+1 for each Equipment attached to it.",
    },
  ],
});
