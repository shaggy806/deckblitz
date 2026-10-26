import { defineCard } from "../define.js";

// EDHREC rank 27017. One ability with two trigger events (`sameAbilityAs`).
const CHARGE_TEXT =
  "At the beginning of your upkeep and whenever you cast a black spell, put a charge counter on this artifact.";
const DISCARD_TEXT =
  "{4}, {T}, Sacrifice this artifact: Target player discards a card for each charge counter on this artifact.";

export default defineCard({
  name: "Shrine of Limitless Power",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${CHARGE_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B"] } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: ["player"],
      // Counted as it last existed on the battlefield — Culling Dais's shape.
      effect: { kind: "discard", target: 0, amount: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
