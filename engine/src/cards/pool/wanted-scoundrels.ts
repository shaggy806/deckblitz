import { defineCard } from "../define.js";

// EDHREC rank 21310.

export default defineCard({
  name: "Wanted Scoundrels",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 4,
  toughness: 3,
  text: "When this creature dies, target opponent creates two Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "Treasure Token", count: 2, who: "target-controller" },
      resolve: null,
      text: "When this creature dies, target opponent creates two Treasure tokens.",
    },
  ],
});
