import { defineCard } from "../define.js";

// EDHREC rank 26491. Foggy Swamp Hunters' "drawn two or more cards this turn"
// static, with a +1/+0.
const ETB_TEXT = "When this creature enters, draw a card, then discard a card.";
const STATIC_TEXT = "As long as you've drawn two or more cards this turn, this creature gets +1/+0 and has menace.";

export default defineCard({
  name: "Evangel of Synthesis",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 },
      grantPt: [1, 0],
      grantKeywords: ["menace"],
      text: STATIC_TEXT,
    },
  ],
});
