import { defineCard } from "../define.js";

// Ruling: once it has become blocked, getting the city's blessing doesn't
// unblock it — "can't be blocked" is checked only as blockers are declared.
const BLESSED = "As long as you have the city's blessing, this creature has hexproof and can't be blocked.";

export default defineCard({
  name: "Slippery Scoundrel",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  keywords: ["ascend"],
  text: `Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${BLESSED}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "citys-blessing" },
      grantKeywords: ["hexproof", "unblockable"],
      text: BLESSED,
    },
  ],
});
