import { defineCard } from "../define.js";

// EDHREC rank 15618. The activated ability's Warriors are the attacking ones
// as it resolves.
const LORD_TEXT = "Other Warriors you control get +1/+1.";
const STRIKE_TEXT = "{3}{W}: Attacking Warriors you control gain double strike until end of turn.";

export default defineCard({
  name: "Suki, Kyoshi Captain",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 3,
  toughness: 3,
  text: `${LORD_TEXT}\n${STRIKE_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Warrior" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", subtype: "Warrior", controlledBy: "you", attacking: true },
        keyword: "double-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: STRIKE_TEXT,
    },
  ],
});
