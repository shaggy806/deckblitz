import { defineCard } from "../define.js";

export default defineCard({
  name: "Way of the Thief",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2.\nEnchanted creature can't be blocked as long as you control a Gate.",
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." },
    {
      affects: { scope: "attached" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 1 },
      grantKeywords: ["unblockable"],
      text: "Enchanted creature can't be blocked as long as you control a Gate.",
    },
  ],
});
