import { defineCard } from "../define.js";

// EDHREC rank 24426. One ability with two trigger events (`sameAbilityAs`).
const CHARGE_TEXT =
  "At the beginning of your upkeep and whenever you cast a blue spell, put a charge counter on this artifact.";
const LOOK_TEXT =
  "{T}, Sacrifice this artifact: Look at the top X cards of your library, where X is the number of charge counters on this artifact. Put one of those cards into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Shrine of Piercing Vision",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${CHARGE_TEXT}\n${LOOK_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      // Counted as it last existed on the battlefield — Culling Dais's shape.
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { countersOn: "source", counter: "charge" },
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
