import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 18710.
//
// Rulings:
//   If the chosen target is an illegal target by the time Riddle of Lightning tries to resolve,
//     the spell doesn't resolve. You don't scry 3 or reveal any card.
//   If a card in a player's library has {X} in its mana cost, X is considered to be 0.
//
// Cerebral Eruption's shape: the top card revealed where it lies (`reveal-top`, rule 701.20a),
// its mana value read through `{ thisWay: "revealed" }` (0 with an empty library), dealt to the
// spell's own target.
const TEXT =
  "Choose any target. Scry 3, then reveal the top card of your library. Riddle of Lightning deals damage equal to that card's mana value to that permanent or player.";
const REVEALED_MV = { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "revealed" } } as const;

export default defineCard({
  name: "Riddle of Lightning",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "scry", amount: 3 },
      { kind: "reveal-top", then: { kind: "sequence", effects: [] } },
      { kind: "damage", amount: REVEALED_MV, target: 0 },
    ],
  },
});
