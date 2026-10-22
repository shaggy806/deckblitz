import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 26016.
//
// "An opponent" is an opponent of the Aura's controller (the `opponent-controls`
// condition reads from the static's controller's side).

export default defineCard({
  name: "Green Scarab",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't be blocked by green creatures.\nEnchanted creature gets +2/+2 as long as an opponent controls a green permanent.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      cantBeBlockedBy: { colors: ["G"] },
      text: "Enchanted creature can't be blocked by green creatures.",
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "opponent-controls", filter: { colors: ["G"] }, atLeast: 1 },
      grantPt: [2, 2],
      text: "Enchanted creature gets +2/+2 as long as an opponent controls a green permanent.",
    },
  ],
});
