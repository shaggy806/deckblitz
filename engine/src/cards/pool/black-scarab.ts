import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 24776.

export default defineCard({
  name: "Black Scarab",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't be blocked by black creatures.\nEnchanted creature gets +2/+2 as long as an opponent controls a black permanent.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      cantBeBlockedBy: { colors: ["B"] },
      text: "Enchanted creature can't be blocked by black creatures.",
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "opponent-controls", filter: { colors: ["B"] }, atLeast: 1 },
      grantPt: [2, 2],
      text: "Enchanted creature gets +2/+2 as long as an opponent controls a black permanent.",
    },
  ],
});
