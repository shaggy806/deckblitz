import { defineCard } from "../define.js";

const UNBLOCKABLE_TEXT = "As long as you have the city's blessing, Detectives you control can't be blocked.";
const DRAW_TEXT = "Whenever you draw your second card each turn, create a 2/2 white and blue Detective creature token.";

export default defineCard({
  name: "Detective of the Month",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 3,
  keywords: ["ascend"],
  text: `Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${UNBLOCKABLE_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Detective" },
      condition: { kind: "citys-blessing" },
      grantKeywords: ["unblockable"],
      text: UNBLOCKABLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Detective Token", count: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
