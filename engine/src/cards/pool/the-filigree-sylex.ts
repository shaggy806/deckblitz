import { defineCard } from "../define.js";

// EDHREC rank 16397.
//
// The second ability counts the oil counters as it last was, having been
// sacrificed to pay for it. The third removes ten oil counters from among
// permanents you control — the Sylex's own included — as part of its cost.

export default defineCard({
  name: "The Filigree Sylex",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "{T}: Put an oil counter on The Filigree Sylex.\n{T}, Sacrifice The Filigree Sylex: Destroy each nonland permanent with mana value equal to the number of oil counters on The Filigree Sylex.\n{T}, Remove ten oil counters from among permanents you control and sacrifice The Filigree Sylex: It deals 10 damage to any target.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: "{T}: Put an oil counter on The Filigree Sylex.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: {
          notTypes: ["land"],
          manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "oil" } } },
        },
      },
      resolve: null,
      text: "{T}, Sacrifice The Filigree Sylex: Destroy each nonland permanent with mana value equal to the number of oil counters on The Filigree Sylex.",
    },
    {
      cost: {
        mana: null,
        tap: true,
        removeCounter: { kind: "oil", count: 10, from: {}, among: true },
        sacrifice: "self",
      },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 10, target: 0 },
      resolve: null,
      text: "{T}, Remove ten oil counters from among permanents you control and sacrifice The Filigree Sylex: It deals 10 damage to any target.",
    },
  ],
});
