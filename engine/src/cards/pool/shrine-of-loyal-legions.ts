import { defineCard } from "../define.js";

// EDHREC rank 17612. One ability with two trigger events (`sameAbilityAs`).
// The token count reads the sacrificed Shrine's counters as it last existed
// (rule 608.2h — Magma Mine).
const CHARGE = "At the beginning of your upkeep and whenever you cast a white spell, put a charge counter on this artifact.";
const SAC =
  "{3}, {T}, Sacrifice this artifact: Create a 1/1 colorless Phyrexian Myr artifact creature token for each charge counter on this artifact.";

export default defineCard({
  name: "Shrine of Loyal Legions",
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
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"] } },
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
      targets: [],
      effect: {
        kind: "create-token",
        token: "Phyrexian Myr Token (Myr Sire)",
        count: { countersOn: "source", counter: "charge" },
      },
      resolve: null,
      text: SAC,
    },
  ],
});
