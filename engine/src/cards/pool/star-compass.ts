import { defineCard } from "../define.js";

// EDHREC rank 4736.

export default defineCard({
  name: "Star Compass",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters tapped.\n{T}: Add one mana of any color that a basic land you control could produce.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { producedBy: "your-lands", filter: { supertype: "basic" } }, amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color that a basic land you control could produce.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
