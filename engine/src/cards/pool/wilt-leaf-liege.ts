import { defineCard } from "../define.js";

const GREEN_TEXT = "Other green creatures you control get +1/+1.";
const WHITE_TEXT = "Other white creatures you control get +1/+1.";
const DISCARD_TEXT =
  "If a spell or ability an opponent controls causes you to discard this card, put it onto the battlefield instead of putting it into your graveyard.";

export default defineCard({
  name: "Wilt-Leaf Liege",
  manaCost: "{1}{G/W}{G/W}{G/W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Elf", "Knight"],
  power: 4,
  toughness: 4,
  text: `({G/W} can be paid with either {G} or {W}.)\n${GREEN_TEXT}\n${WHITE_TEXT}\n${DISCARD_TEXT}`,
  discardedByOpponentEnters: {},
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", colors: ["G"] }, excludeSelf: true },
      grantPt: [1, 1],
      text: GREEN_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", colors: ["W"] }, excludeSelf: true },
      grantPt: [1, 1],
      text: WHITE_TEXT,
    },
  ],
});
