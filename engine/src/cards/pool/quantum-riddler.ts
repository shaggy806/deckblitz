import { defineCard } from "../define.js";

const ETB = "When this creature enters, draw a card.";
const DRAW = "As long as you have one or fewer cards in hand, if you would draw one or more cards, you draw that many cards plus one instead.";
const WARP = "Warp {1}{U}";

export default defineCard({
  name: "Quantum Riddler",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 6,
  keywords: ["flying"],
  warp: { cost: "{1}{U}" },
  text: `Flying\n${ETB}\n${DRAW}\n${WARP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ETB,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 1 },
      replacement: { event: "would-draw", who: "you", instruction: { atLeast: 1 }, instead: { modify: { plus: 1 } } },
      text: DRAW,
    },
  ],
});
