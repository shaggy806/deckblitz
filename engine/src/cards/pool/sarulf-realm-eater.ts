import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 10563.
//
// The upkeep ability: an intervening-if on its +1/+1 counters (rule 603.4), and nothing at all
// if Sarulf has left by resolution (its ruling). "Remove all of them … the number of counters
// removed this way" — every +1/+1 counter goes, so the number is the count on it as it resolves:
// the exile reads that count first, then the counters come off, in the same resolution (no
// player acts in between — its ruling), so the order is invisible.
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if Sarulf has one or more +1/+1 counters on it, you may remove all of them. If you do, exile each other nonland permanent with mana value less than or equal to the number of counters removed this way.";
const COUNTERS = { countersOn: "source", counter: "+1/+1" } as const;

export default defineCard({
  name: "Sarulf, Realm Eater",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 3,
  text: `Whenever a permanent an opponent controls is put into a graveyard from the battlefield, put a +1/+1 counter on Sarulf.\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a permanent an opponent controls is put into a graveyard from the battlefield, put a +1/+1 counter on Sarulf.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "may",
          prompt: "Remove all +1/+1 counters from Sarulf?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "exile-all",
                filter: { notTypes: ["land"], manaValue: { op: "lte", n: { amount: COUNTERS } } },
                exceptSource: true,
              },
              { kind: "remove-counter", target: "source", counter: "+1/+1", amount: COUNTERS },
            ],
          },
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
