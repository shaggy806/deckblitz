import { defineCard } from "../define.js";

// The fate counters come off every permanent after the destruction — the
// lands' and the survivors' (an indestructible one keeps none either) —
// through `remove-counter-all`, read over the permanents that are left.

const FATE_TEXT = "{4}, {T}: Put a fate counter on target permanent.";
const WIPE_TEXT =
  "{5}, {T}, Sacrifice this artifact: Destroy each nonland permanent without a fate counter on it, then remove all fate counters from all permanents.";

export default defineCard({
  name: "Oblivion Stone",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${FATE_TEXT}\n${WIPE_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: ["permanent"],
      effect: { kind: "add-counter", target: 0, counter: "fate", amount: 1 },
      resolve: null,
      text: FATE_TEXT,
    },
    {
      cost: { mana: "{5}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "destroy-all",
            filter: { notTypes: ["land"], counters: { kind: "fate", compare: { op: "eq", n: 0 } } },
          },
          { kind: "remove-counter-all", filter: {}, counter: "fate", amount: "all" },
        ],
      },
      resolve: null,
      text: WIPE_TEXT,
    },
  ],
});
