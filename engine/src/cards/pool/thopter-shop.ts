import { defineCard } from "../define.js";

// EDHREC rank 8004.

const DRAW_TEXT =
  "Whenever one or more artifact creatures you control die, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Thopter Shop",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${DRAW_TEXT}\n{2}{W}, {T}: Create a 1/1 colorless Thopter artifact creature token with flying.`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: "{2}{W}, {T}: Create a 1/1 colorless Thopter artifact creature token with flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { types: ["artifact", "creature"] } },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
