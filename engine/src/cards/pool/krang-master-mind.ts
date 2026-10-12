import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 10885.
//
// The draw is an intervening "if" (rule 603.4 — its ruling): with four or
// more cards in hand it doesn't trigger, and it checks again as it resolves.
// The difference is counted then (The Ten Rings' shape).
const DRAW = "When Krang enters, if you have fewer than four cards in hand, draw cards equal to the difference.";
const PUMP = "Krang gets +1/+0 for each other artifact you control.";

export default defineCard({
  name: "Krang, Master Mind",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Utrom", "Warrior"],
  power: 1,
  toughness: 4,
  selfCostReduction: affinity({ type: "artifact" }),
  text: `Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\n${DRAW}\n${PUMP}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0], excludeSelf: true },
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "hand-size", atMost: 3 },
      targets: [],
      effect: { kind: "draw", amount: { difference: [4, { cardsInHand: "you" }] } },
      resolve: null,
      text: DRAW,
    },
  ],
});
