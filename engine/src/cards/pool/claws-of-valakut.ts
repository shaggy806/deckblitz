import { defineCard } from "../define.js";

// EDHREC rank 10560. Ethereal Armor's shape.

const TEXT = "Enchanted creature gets +1/+0 for each Mountain you control and has first strike.";

export default defineCard({
  name: "Claws of Valakut",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Mountain", controlledBy: "you" }, pt: [1, 0] },
      grantKeywords: ["first-strike"],
      text: TEXT,
    },
  ],
});
