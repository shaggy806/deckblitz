import { defineCard } from "../define.js";

// EDHREC rank 15645.
//
// A modal triggered ability: its modes are chosen as it goes on the stack
// (rule 700.2b), so "if you have exactly 13 life" is read then (SOLDIER
// Military Program's shape).
const DIES_TEXT = "When this creature dies, choose one. If you have exactly 13 life, you may choose both instead.";
const DRAW_MODE = "You draw a card and you lose 1 life.";
const EXILE_MODE = "Exile target opponent's graveyard. That player loses 1 life.";

export default defineCard({
  name: "Disciple of Perdition",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 1,
  toughness: 3,
  text: `${DIES_TEXT}\n• ${DRAW_MODE}\n• ${EXILE_MODE}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: {
          ifCondition: { kind: "life-total", who: "you", atLeast: 13, atMost: 13 },
          then: 2,
          else: 1,
        },
        modes: [
          {
            text: DRAW_MODE,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                { kind: "lose-life", amount: 1 },
              ],
            },
          },
          {
            text: EXILE_MODE,
            targets: ["opponent"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "exile-graveyard", target: 0 },
                { kind: "lose-life", amount: 1, target: 0 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
