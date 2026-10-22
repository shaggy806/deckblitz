import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 26487.

const EVASION_TEXT = "Enchanted creature can't be blocked by red creatures.";
const PUMP_TEXT = "Enchanted creature gets +2/+2 as long as an opponent controls a red permanent.";

export default defineCard({
  name: "Red Scarab",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${EVASION_TEXT}\n${PUMP_TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, cantBeBlockedBy: { colors: ["R"] }, text: EVASION_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "opponent-controls", filter: { colors: ["R"] }, atLeast: 1 },
      grantPt: [2, 2],
      text: PUMP_TEXT,
    },
  ],
});
