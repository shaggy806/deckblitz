import { defineCard } from "../define.js";

// EDHREC rank 16577.
//
// Rulings:
//   [2008-05-01] The abilities are separate and cumulative. If another creature you control is
//     both of the listed colors, it will get a total of +2/+2.
//
// "That player" is whoever controls the spell or ability that targeted the
// Liege — a becomes-target trigger's `"trigger-player"` (Black Bolt, Inhuman
// King). Not a target.
const BLACK_TEXT = "Other black creatures you control get +1/+1.";
const RED_TEXT = "Other red creatures you control get +1/+1.";
const TARGET_TEXT =
  "Whenever this creature becomes the target of a spell or ability an opponent controls, that player loses 4 life.";

export default defineCard({
  name: "Ashenmoor Liege",
  manaCost: "{1}{B/R}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Knight"],
  power: 4,
  toughness: 1,
  text: `${BLACK_TEXT}\n${RED_TEXT}\n${TARGET_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: BLACK_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["R"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: RED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "lose-life", amount: 4, who: "trigger-player" },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
});
