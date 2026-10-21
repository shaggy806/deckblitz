import { defineCard } from "../define.js";

// The soul counter is part of the cost; the life loss counts the counters as
// the ability resolves — as the Altar last existed if it has left (the
// rulings; `countersOn` reads last-known information). With no commander in
// the command zone it only costs life; with two there, one of your choice
// (Command Beacon's `look-and-choose`).
const TEXT =
  "{T}, Put a soul counter on this artifact: Put your commander into your hand from the command zone. Then you lose 3 life for each soul counter on this artifact.";

export default defineCard({
  name: "Netherborn Altar",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, addCounter: { kind: "soul", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-and-choose", zone: "command", min: 1, max: 1, destination: "hand", leftover: "stay" },
          { kind: "lose-life", amount: { product: [3, { countersOn: "source", counter: "soul" }] }, who: "you" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
