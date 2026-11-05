import { defineCard } from "../define.js";

// EDHREC rank 25589.

export default defineCard({
  name: "Loxodon Punisher",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Soldier"],
  power: 2,
  toughness: 2,
  text: "This creature gets +2/+2 for each Equipment attached to it.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Equipment", attachedTo: { isSource: true } }, pt: [2, 2] },
      text: "This creature gets +2/+2 for each Equipment attached to it.",
    },
  ],
});
