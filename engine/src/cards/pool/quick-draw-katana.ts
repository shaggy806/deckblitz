import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 8453.

const EQUIPPED_TEXT = "During your turn, equipped creature gets +2/+0 and has first strike.";

export default defineCard({
  name: "Quick-Draw Katana",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${EQUIPPED_TEXT} (It deals combat damage before creatures without first strike.)\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "your-turn" },
      grantPt: [2, 0],
      grantKeywords: ["first-strike"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
