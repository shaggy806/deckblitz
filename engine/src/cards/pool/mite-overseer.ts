import { defineCard } from "../define.js";

// EDHREC rank 7909.
// Makes "Phyrexian Mite Token".

const STATIC_TEXT = "During your turn, creature tokens you control get +1/+0 and have first strike.";
const MITE_TEXT =
  '{3}{W/P}: Create a 1/1 colorless Phyrexian Mite artifact creature token with toxic 1 and "This token can\'t block." (Players dealt combat damage by it also get a poison counter. {W/P} can be paid with either {W} or 2 life.)';

export default defineCard({
  name: "Mite Overseer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Soldier"],
  power: 4,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${STATIC_TEXT}\n${MITE_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", tokenOnly: true },
      condition: { kind: "your-turn" },
      grantPt: [1, 0],
      grantKeywords: ["first-strike"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W/P}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Mite Token", count: 1 },
      resolve: null,
      text: MITE_TEXT,
    },
  ],
});
