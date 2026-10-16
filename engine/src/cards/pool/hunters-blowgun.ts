import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 7739.

// "During your turn" is Alpharael's `your-turn` condition; "otherwise" its
// negation.
const PUMP_TEXT = "Equipped creature gets +1/+1.";
const KEYWORD_TEXT = "Equipped creature has deathtouch during your turn. Otherwise, it has reach.";

export default defineCard({
  name: "Hunter's Blowgun",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${KEYWORD_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [equip("{2}")],
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 1], text: PUMP_TEXT },
    { affects: { scope: "attached" }, condition: { kind: "your-turn" }, grantKeywords: ["deathtouch"], text: KEYWORD_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      grantKeywords: ["reach"],
      text: KEYWORD_TEXT,
    },
  ],
});
