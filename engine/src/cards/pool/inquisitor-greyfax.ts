import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 10017.

const WISDOM_TEXT = "Unquestionable Wisdom — Other creatures you control get +1/+0 and have vigilance.";
const HERESY_TEXT =
  'Hunt for Heresy — {1}, {T}: Tap target creature an opponent controls. Investigate. (Create a Clue token. It\'s an artifact with "{2}, Sacrifice this token: Draw a card.")';

export default defineCard({
  name: "Inquisitor Greyfax",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Inquisitor"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${WISDOM_TEXT}\n${HERESY_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantPt: [1, 0],
      grantKeywords: ["vigilance"],
      text: WISDOM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "sequence", effects: [{ kind: "tap", target: 0 }, investigate()] },
      resolve: null,
      text: HERESY_TEXT,
    },
  ],
});
