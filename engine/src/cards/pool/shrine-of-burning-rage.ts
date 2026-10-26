import { defineCard } from "../define.js";

// EDHREC rank 20851. One ability with two trigger events (`sameAbilityAs`).
// The damage reads the sacrificed Shrine's counters as it last existed
// (rule 608.2h — Magma Mine).
const CHARGE = "At the beginning of your upkeep and whenever you cast a red spell, put a charge counter on this artifact.";
const SAC = "{3}, {T}, Sacrifice this artifact: It deals damage equal to the number of charge counters on it to any target.";

export default defineCard({
  name: "Shrine of Burning Rage",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${CHARGE}\n${SAC}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: SAC,
    },
  ],
});
