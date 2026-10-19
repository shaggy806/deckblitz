import { defineCard } from "../define.js";

// EDHREC rank 10611.
//
// A modal spell (`castModal`): Ambition's Cost's draw-and-lose, or Cower in
// Fear's -1/-1 to the creatures your opponents control as it resolves.

const DRAW = "You draw two cards and you lose 2 life.";
const SHRINK = "Creatures your opponents control get -1/-1 until end of turn.";

export default defineCard({
  name: "Gruesome Realization",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Choose one —\n• ${DRAW}\n• ${SHRINK}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DRAW,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 2 },
            { kind: "lose-life", amount: 2 },
          ],
        },
      },
      {
        text: SHRINK,
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "opponent" },
          power: -1,
          toughness: -1,
          duration: "end-of-turn",
        },
      },
    ],
  },
});
