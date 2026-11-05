import { defineCard } from "../define.js";

// EDHREC rank 1623.
//
// Rulings:
//   [2021-02-05] The check of whether Replicating Ring has eight or more night counters on it
//     happens only as part of the resolution of the triggered ability. If Replicating Ring picks
//     up its eighth night counter at another time, you won't immediately create Replicated Rings.
//     You'll have to wait until the next time the triggered ability resolves.
//
// The count is read as the trigger resolves, after its own counter (a
// `conditional` inside it, not an intervening if); "remove all of them" is
// `amount: "all"`.
const UPKEEP_TEXT =
  'At the beginning of your upkeep, put a night counter on this artifact. Then if it has eight or more night counters on it, remove all of them and create eight colorless snow artifact tokens named Replicated Ring with "{T}: Add one mana of any color."';

export default defineCard({
  name: "Replicating Ring",
  manaCost: "{3}",
  colors: [],
  supertypes: ["snow"],
  types: ["artifact"],
  text: `{T}: Add one mana of any color.\n${UPKEEP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "night", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "night", compare: { op: "gte", n: 8 } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "remove-counter", target: "source", counter: "night", amount: "all" },
                { kind: "create-token", token: "Replicated Ring Token", count: 8 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
