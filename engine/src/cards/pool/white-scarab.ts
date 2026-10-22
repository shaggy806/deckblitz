import { defineCard } from "../define.js";

// EDHREC rank 25057. "An opponent" is an opponent of the Aura's controller.
const BLOCK_TEXT = "Enchanted creature can't be blocked by white creatures.";
const PUMP_TEXT = "Enchanted creature gets +2/+2 as long as an opponent controls a white permanent.";

export default defineCard({
  name: "White Scarab",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${BLOCK_TEXT}\n${PUMP_TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, cantBeBlockedBy: { colors: ["W"] }, text: BLOCK_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "opponent-controls", filter: { colors: ["W"] }, atLeast: 1 },
      grantPt: [2, 2],
      text: PUMP_TEXT,
    },
  ],
});
