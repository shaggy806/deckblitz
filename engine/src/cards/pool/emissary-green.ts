import { defineCard } from "../define.js";

// EDHREC rank 8630. Fallout (PIP).
//
// A vote (rule 701.38 — Selvala's Stampede's shape): as it resolves, starting
// with its controller and in turn order, each player votes profit or
// security, each knowing the votes before theirs, nobody abstaining (the
// rulings). Then the tally: two Treasures per profit vote, and that many
// +1/+1 counters per security vote on each creature you control.
const TEXT =
  "Whenever Emissary Green attacks, starting with you, each player votes for profit or security. You create a number of Treasure tokens equal to twice the number of profit votes. Put a number of +1/+1 counters on each creature you control equal to the number of security votes.";

const NOTHING = { kind: "sequence", effects: [] } as const;

export default defineCard({
  name: "Emissary Green",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "each-player-may",
            who: "each-player",
            startingWithYou: true,
            choices: [
              { text: "Vote for profit", effect: NOTHING },
              { text: "Vote for security", effect: NOTHING },
            ],
          },
          { kind: "create-token", token: "Treasure Token", count: { product: [2, { votesFor: 0 }] } },
          {
            kind: "add-counter-all",
            filter: { type: "creature", controlledBy: "you" },
            counter: "+1/+1",
            amount: { votesFor: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
