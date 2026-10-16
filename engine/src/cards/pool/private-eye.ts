import { defineCard } from "../define.js";

const ANTHEM_TEXT = "Other Detectives you control get +1/+1.";
const DRAW_TEXT = "Whenever you draw your second card each turn, target Detective can't be blocked this turn.";

export default defineCard({
  name: "Private Eye",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Homunculus", "Detective"],
  power: 3,
  toughness: 3,
  text: `${ANTHEM_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Detective" },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      // "Target Detective": any permanent with the creature type (only a
      // creature or a kindred permanent can have one, rule 205.3d).
      targets: [{ kind: "permanent", filter: { subtype: "Detective" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
