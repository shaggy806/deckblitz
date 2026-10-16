import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const STATIC_TEXT = "Equipped creature gets +1/+2, has reach, and can't be blocked by more than one creature.";
const DRAW_TEXT = "{2}, Sacrifice this Equipment: Draw a card.";

export default defineCard({
  name: "Rope",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Clue", "Equipment"],
  text: `${STATIC_TEXT}\n${DRAW_TEXT}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 2],
      grantKeywords: ["reach"],
      blockedByAtMostOne: true,
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
    equip("{3}"),
  ],
});
