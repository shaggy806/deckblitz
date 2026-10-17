import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// The loss reaches the permanents opponents control as it resolves (rule
// 611.2c): one entering later, or gaining hexproof or indestructible
// afterwards, keeps it (the rulings).

const LOSE_TEXT = "{1}: Permanents your opponents control lose hexproof and indestructible until end of turn.";

export default defineCard({
  name: "Shadowspear",
  manaCost: "{1}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1 and has trample and lifelink.\n${LOSE_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["trample", "lifelink"],
      text: "Equipped creature gets +1/+1 and has trample and lifelink.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "lose-keywords",
        filter: { controlledBy: "opponent" },
        keywords: ["hexproof", "indestructible"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: LOSE_TEXT,
    },
    equip("{2}"),
  ],
});
