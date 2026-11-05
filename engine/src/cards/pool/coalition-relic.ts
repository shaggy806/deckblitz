import { defineCard } from "../define.js";

// EDHREC rank 3455. Each removed counter's mana may be a different colour (the
// ruling): `oneOf` every colour, Sage of the Maze's "any combination".

const TEXT =
  "At the beginning of your first main phase, remove all charge counters from this artifact. Add one mana of any color for each charge counter removed this way.";

export default defineCard({
  name: "Coalition Relic",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add one mana of any color.\n{T}: Put a charge counter on this artifact.\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{T}: Put a charge counter on this artifact.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "charge", amount: "all" },
          {
            kind: "add-mana",
            mana: { oneOf: ["W", "U", "B", "R", "G"] },
            amount: { thisWay: "counters-removed" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
