import { defineCard } from "../define.js";

// EDHREC rank 14756.

const TEXT = "Enchanted creature gets +1/+0 for each Mountain you control.";

export default defineCard({
  name: "Granite Grip",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      // "You" is the Aura's controller, not the enchanted creature's.
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Mountain", controlledBy: "you" }, pt: [1, 0] },
      text: TEXT,
    },
  ],
});
