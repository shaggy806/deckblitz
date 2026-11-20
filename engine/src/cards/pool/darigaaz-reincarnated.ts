import { defineCard } from "../define.js";

// EDHREC rank 16306.
//
// - A self "would die" replacement (`self: true`) that exiles it with three
//   egg counters (`withCounters`, as Ravenloft Adventurer's).
// - The upkeep ability works only in exile (rule 113.6k, `fromExile`), with an
//   intervening "if" (603.4) on the zone and an egg counter; "Then if this card
//   has no egg counters" is read as it resolves (Evolved Spinoderm's shape).
//   Both read the exiled card itself (a `source` filter): `self-counters` reads
//   a source off the battlefield as it last existed there.
//
// Rulings:
//   - If another effect says to exile Darigaaz if it would die, you may apply Darigaaz's own
//     effect first, giving it three egg counters.
//   - If Darigaaz is exiled without any egg counters on it, its last ability won't trigger and
//     won't return it to the battlefield.

const REPLACE = "If Darigaaz would die, instead exile it with three egg counters on it.";
const UPKEEP =
  "At the beginning of your upkeep, if this card is exiled with an egg counter on it, remove an egg counter from it. Then if this card has no egg counters on it, return it to the battlefield.";

export default defineCard({
  name: "Darigaaz Reincarnated",
  manaCost: "{4}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "trample", "haste"],
  text: `Flying, trample, haste\n${REPLACE}\n${UPKEEP}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        self: true,
        from: "battlefield",
        withCounters: { kind: "egg", amount: 3 },
      },
      text: REPLACE,
    },
  ],
  triggered: [
    {
      fromExile: true,
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "source-zone", zones: ["exile"], sameObject: true },
          { kind: "source", filter: { counters: { kind: "egg", compare: { op: "gte", n: 1 } } } },
        ],
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "egg", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { counters: { kind: "egg", compare: { op: "eq", n: 0 } } } },
            then: { kind: "put-onto-battlefield", target: "source" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
