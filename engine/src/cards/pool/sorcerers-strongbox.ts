import { defineCard } from "../define.js";

// EDHREC rank 16732. Won, it's sacrificed if its controller still controls
// it, and they draw three either way (the ruling); lost, nothing happens.
//
// Rulings:
//   If you no longer control Sorcerer's Strongbox by the time you win the flip, you won't be able
//     to sacrifice it. You'll still draw three cards, though.
//   If you lose the flip, nothing happens.
const TEXT = "{2}, {T}: Flip a coin. If you win the flip, sacrifice this artifact and draw three cards.";

export default defineCard({
  name: "Sorcerer's Strongbox",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "flip-coin",
        won: {
          kind: "sequence",
          effects: [{ kind: "sacrifice-source" }, { kind: "draw", amount: 3 }],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
