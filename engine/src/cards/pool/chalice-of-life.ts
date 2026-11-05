import { defineCard } from "../define.js";

// Rulings:
//   Your starting life total is the life total you began the game with.
//   You check your life total to see if Chalice of Life transforms only when its ability resolves.

const TEXT =
  "{T}: You gain 1 life. Then if you have at least 10 life more than your starting life total, transform this artifact.";

export default defineCard({
  name: "Chalice of Life",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "life-total", atLeast: { startingPlus: 10 } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Chalice of Life", "Chalice of Death"],
  transform: true,
});
