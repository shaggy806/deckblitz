import { defineCard } from "../define.js";

// Rulings:
//   Since you can respond to triggered abilities, it is legal to sacrifice creatures prior to
//     resolving the ability that removes the final counter from All Hallow's Eve.
//   Each creature returned to the battlefield by All Hallow's Eve enters under its owner's control.
//   All Hallow's Eve's triggered ability functions from the exile zone. This ability has an
//     "intervening 'if' clause." It won't trigger at all unless All Hallow's Eve is exiled and has
//     a scream counter on it (which can happen only if it resolves as a spell).
//   The only thing that happens when All Hallow's Eve resolves is that it's exiled with two scream
//     counters on it.
//
// The spell exiles itself as it resolves, so it doesn't go to the graveyard after (rule 608.2n).
// The upkeep trigger works from exile only (rule 113.6k, Senu's `fromExile`), its intervening
// "if" (rule 603.4) the same card still in exile (rule 400.7) with a scream counter, read again
// as it resolves. The counters are read where the card is (`countersOn`), not a permanent's.
const RESOLVE = "Exile All Hallow's Eve with two scream counters on it.";
const UPKEEP =
  "At the beginning of your upkeep, if this card is exiled with a scream counter on it, remove a scream counter from it. If there are no more scream counters on it, put it into your graveyard and each player returns all creature cards from their graveyard to the battlefield.";
const SCREAMS = { countersOn: "source", counter: "scream" } as const;

export default defineCard({
  name: "All Hallow's Eve",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${RESOLVE}\n${UPKEEP}`,
  targets: [],
  effect: { kind: "exile", target: "source", withCounters: { kind: "scream", amount: 2 } },
  triggered: [
    {
      fromExile: true,
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "source-zone", zones: ["exile"], sameObject: true },
          { kind: "amounts", left: SCREAMS, op: "gte", right: 1 },
        ],
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "scream", amount: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "source-zone", zones: ["exile"], sameObject: true },
                { kind: "amounts", left: SCREAMS, op: "eq", right: 0 },
              ],
            },
            then: {
              kind: "sequence",
              effects: [
                { kind: "put-into-graveyard", target: "source" },
                {
                  kind: "return-from-graveyard",
                  from: "each-graveyard",
                  filter: { type: "creature" },
                  destination: "battlefield",
                  count: "all",
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
