import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const STATIC_TEXT = "During your turn, equipped creature gets +1/+0 and has first strike.";
const DRAW_TEXT = "{2}, Sacrifice this Equipment: Draw a card.";

export default defineCard({
  name: "Knife",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Clue", "Equipment"],
  text: `${STATIC_TEXT}\n${DRAW_TEXT}\nEquip {2}`,
  static: [
    {
      // "Your turn" is the Equipment's controller's (Quick-Draw Katana).
      affects: { scope: "attached" },
      condition: { kind: "your-turn" },
      grantPt: [1, 0],
      grantKeywords: ["first-strike"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    equip("{2}"),
  ],
});
