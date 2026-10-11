import { defineCard } from "../define.js";

const LORD_TEXT = "Other Villains you control get +2/+2 and have flying and haste.";
const MAYHEM_TEXT =
  "Mayhem {3}{U}{R} (You may cast this card from your graveyard for {3}{U}{R} if you discarded it this turn. Timing rules still apply.)";

export default defineCard({
  name: "The Squadron Sinister",
  manaCost: "{5}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "haste"],
  mayhem: { cost: "{3}{U}{R}" },
  text: `Flying, haste\n${LORD_TEXT}\n${MAYHEM_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Villain", controlledBy: "you" }, excludeSelf: true },
      grantPt: [2, 2],
      grantKeywords: ["flying", "haste"],
      text: LORD_TEXT,
    },
  ],
});
