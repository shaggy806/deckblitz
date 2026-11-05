import { defineCard } from "../define.js";

// EDHREC rank 27029.

export default defineCard({
  name: "Pulse of the Fields",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain 4 life. Then if an opponent has more life than you, return Pulse of the Fields to its owner's hand.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 4 },
      {
        kind: "conditional",
        condition: { kind: "player-compare", stat: "life", compare: "fewer", than: "an-opponent" },
        then: { kind: "return-to-hand", target: "source", from: "stack" },
      },
    ],
  },
});
