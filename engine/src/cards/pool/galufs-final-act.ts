import { defineCard } from "../define.js";

// EDHREC rank 14826.
//
// Fake Your Own Death's shape: the pump and a granted dies trigger, both until
// end of turn. "Its power" is the dying creature's, read as it last existed
// on the battlefield (the ruling) — `powerOf: "source"` of a dies trigger.
//
// Rulings:
//   [2025-06-06] Use the dying creature's power as it last existed on the battlefield to determine
//     how many counters to put on the target creature.

const DIES_TEXT =
  "When this creature dies, put a number of +1/+1 counters equal to its power on up to one target creature.";

export default defineCard({
  name: "Galuf's Final Act",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Until end of turn, target creature gets +1/+0 and gains "${DIES_TEXT}"`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "dies", who: "self" },
          targets: [{ kind: "optional", of: "creature" }],
          effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { powerOf: "source" } },
          resolve: null,
          text: DIES_TEXT,
        },
      },
    ],
  },
});
