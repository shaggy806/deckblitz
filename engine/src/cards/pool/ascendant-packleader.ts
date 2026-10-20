import { defineCard } from "../define.js";

// EDHREC rank 8162.
//
// Rulings:
//   [2021-11-19] Ascendant Packleader's first ability considers only permanents already on the
//     battlefield when determining if it should apply. If Ascendant Packleader is entering the
//     battlefield at the same time as another permanent, the replacement effect won't see that
//     permanent.
//
// The enters-with amount's condition is read as it enters, before it or
// anything entering with it is there (rule 614.12 — Dust Animus's shape),
// which is the ruling.
const ENTER_TEXT =
  "This creature enters with a +1/+1 counter on it if you control a permanent with mana value 4 or greater.";
const CAST_TEXT = "Whenever you cast a spell with mana value 4 or greater, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Ascendant Packleader",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 1,
  text: `${ENTER_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: {
              kind: "controls",
              filter: { controlledBy: "you", manaValue: { op: "gte", n: 4 } },
              atLeast: 1,
            },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
