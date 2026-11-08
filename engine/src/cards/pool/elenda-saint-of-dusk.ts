import { defineCard } from "../define.js";

// EDHREC rank 4837. Hexproof from instants (`hexproofFrom.types`); the two
// life-total statics read against the game's starting life total.

const HEXPROOF_TEXT = "Hexproof from instants";
const ABOVE_TEXT = "As long as your life total is greater than your starting life total, Elenda gets +1/+1 and has menace.";
const FAR_ABOVE_TEXT =
  "Elenda gets an additional +5/+5 as long as your life total is at least 10 greater than your starting life total.";

export default defineCard({
  name: "Elenda, Saint of Dusk",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink, hexproof from instants\n${ABOVE_TEXT} ${FAR_ABOVE_TEXT}`,
  static: [
    { affects: { scope: "self" }, hexproofFrom: { types: ["instant"] }, text: HEXPROOF_TEXT },
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", atLeast: { startingPlus: 1 } },
      grantPt: [1, 1],
      grantKeywords: ["menace"],
      text: ABOVE_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", atLeast: { startingPlus: 10 } },
      grantPt: [5, 5],
      text: FAR_ABOVE_TEXT,
    },
  ],
});
