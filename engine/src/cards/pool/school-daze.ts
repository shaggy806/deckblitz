import { defineCard } from "../define.js";

const HOMEWORK = "• Do Homework — Draw three cards.";
const CRIME = "• Fight Crime — Counter target spell. Draw a card.";

export default defineCard({
  name: "School Daze",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n${HOMEWORK}\n${CRIME}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: HOMEWORK, targets: [], effect: { kind: "draw", amount: 3 } },
      {
        text: CRIME,
        targets: ["spell"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "counter", target: 0 },
            { kind: "draw", amount: 1 },
          ],
        },
      },
    ],
  },
});
