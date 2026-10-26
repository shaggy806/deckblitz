import { defineCard } from "../define.js";

const DRAW = "{2}, {T}: Draw a card if you have seven or more cards in hand.";

export default defineCard({
  name: "Scroll of Origins",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: DRAW,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      // Checked as it resolves, not as it's activated.
      effect: { kind: "conditional", condition: { kind: "hand-size", atLeast: 7 }, then: { kind: "draw", amount: 1 } },
      resolve: null,
      text: DRAW,
    },
  ],
});
