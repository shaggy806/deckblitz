import { defineCard } from "../define.js";

// EDHREC rank 25054.
// One ability with two trigger events (`sameAbilityAs` — Frenzied Fugue's
// shape); the mana ability reads the counters off the sacrificed artifact as
// it last existed, the way a petal-counter Lotus does.

const CHARGE =
  "At the beginning of your upkeep and whenever you cast a green spell, put a charge counter on this artifact.";
const MANA = "{T}, Sacrifice this artifact: Add {C} for each charge counter on this artifact.";

export default defineCard({
  name: "Shrine of Boundless Growth",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${CHARGE}\n${MANA}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["G"] } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: MANA,
    },
  ],
});
