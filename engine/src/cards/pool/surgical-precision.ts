import { defineCard } from "../define.js";

// EDHREC rank 22820.

const DESTROY_MODE = "Destroy target creature with toughness 4 or greater. You gain 1 life.";
const DRAW_MODE = "You draw a card and gain 2 life.";

export default defineCard({
  name: "Surgical Precision",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Choose one —\n• ${DESTROY_MODE}\n• ${DRAW_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DESTROY_MODE,
        targets: [{ kind: "permanent", filter: { type: "creature", toughness: { op: "gte", n: 4 } } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "gain-life", amount: 1 },
          ],
        },
      },
      {
        text: DRAW_MODE,
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "gain-life", amount: 2 },
          ],
        },
      },
    ],
  },
});
