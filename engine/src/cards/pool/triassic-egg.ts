import { defineCard } from "../define.js";

// EDHREC rank 26439.
//
// Rulings:
//   [2004-10-04] You can use the sacrifice ability even if it is tapped.
//
// Its mode is chosen as it's activated, bringing that mode's target
// (rule 700.2b).

const SAC_TEXT =
  "Sacrifice this artifact: Choose one. Activate only if there are two or more hatchling counters on this artifact.\n• You may put a creature card from your hand onto the battlefield.\n• Return target creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Triassic Egg",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `{3}, {T}: Put a hatchling counter on this artifact.\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "hatchling", amount: 1 },
      resolve: null,
      text: "{3}, {T}: Put a hatchling counter on this artifact.",
    },
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      condition: { kind: "self-counters", counter: "hatchling", compare: { op: "gte", n: 2 } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "You may put a creature card from your hand onto the battlefield.",
            effect: {
              kind: "look-and-choose",
              zone: "hand",
              min: 0,
              max: 1,
              destination: "battlefield",
              leftover: "stay",
              filter: { type: "creature" },
            },
          },
          {
            text: "Return target creature card from your graveyard to the battlefield.",
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
            effect: { kind: "put-onto-battlefield", target: 0 },
          },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
