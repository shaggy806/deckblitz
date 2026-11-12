import { defineCard } from "../define.js";

// EDHREC rank 10938. Rulings (2026-01-27): the second target is chosen only
// as the reflexive ability triggers, when the two counters were put this way
// (rule 603.12) — so it waits on a `this-way` "counters-put" condition.
const ENTERS =
  "When this creature enters, put two +1/+1 counters on target creature. When you do, destroy up to one target creature with mana value less than or equal to the number of counters among permanents you control.";
const DRAIN = "{2}, {T}, Sacrifice this creature: You gain 3 life and each opponent loses 3 life.";

export default defineCard({
  name: "Dimension X Pizzasaur",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Food", "Alien", "Mutant"],
  power: 2,
  toughness: 1,
  text: `${ENTERS}\n${DRAIN}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "lose-life", who: "each-opponent", amount: 3 },
        ],
      },
      resolve: null,
      text: DRAIN,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "counters-put", atLeast: 1 },
            then: {
              kind: "reflexive-trigger",
              targets: [
                {
                  kind: "optional",
                  of: {
                    kind: "permanent",
                    filter: {
                      type: "creature",
                      manaValue: {
                        op: "lte",
                        n: { amount: { aggregate: "sum", of: "counters", filter: { controlledBy: "you" } } },
                      },
                    },
                  },
                },
              ],
              effect: { kind: "destroy", target: 0 },
              text: "When you do, destroy up to one target creature with mana value less than or equal to the number of counters among permanents you control.",
            },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
