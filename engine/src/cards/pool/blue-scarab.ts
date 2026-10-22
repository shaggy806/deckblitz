import { defineCard } from "../define.js";

// EDHREC rank 25178.

export default defineCard({
  name: "Blue Scarab",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't be blocked by blue creatures.\nEnchanted creature gets +2/+2 as long as an opponent controls a blue permanent.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      cantBeBlockedBy: { colors: ["U"] },
      text: "Enchanted creature can't be blocked by blue creatures.",
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "opponent-controls", filter: { colors: ["U"] }, atLeast: 1 },
      grantPt: [2, 2],
      text: "Enchanted creature gets +2/+2 as long as an opponent controls a blue permanent.",
    },
  ],
});
