import { defineCard } from "../define.js";

// EDHREC rank 19872.
//
// "An oil counter was removed from a permanent you controlled this turn" is
// the journal's `counters-removed` entries (a cost's, an effect's, any
// player's or none), each in the list of the permanent's controller as the
// counter came off, so one that has left or changed hands since still
// counts. "A permanent with an oil counter on it was put into a graveyard
// this turn" is any player's `to-graveyard` entry from the battlefield, the
// permanent read as it last existed there (rule 603.10a) — a token too,
// which was put there before it ceased to exist (rule 111.7).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, put an oil counter on another target nontoken artifact or creature you control.";
const GOBLIN_TEXT =
  "{2}, {T}: Create a 1/1 red Phyrexian Goblin creature token. Activate only if an oil counter was removed from a permanent you controlled this turn or a permanent with an oil counter on it was put into a graveyard this turn.";

export default defineCard({
  name: "Churning Reservoir",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${GOBLIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"], token: false } },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "oil", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Goblin Token", count: 1 },
      resolve: null,
      condition: {
        kind: "any",
        of: [
          { kind: "turn-history", what: "counters-removed", counter: "oil" },
          {
            kind: "turn-history",
            what: "to-graveyard",
            who: "any-player",
            from: ["battlefield"],
            filter: { counters: { kind: "oil", compare: { op: "gte", n: 1 } } },
          },
        ],
      },
      text: GOBLIN_TEXT,
    },
  ],
});
