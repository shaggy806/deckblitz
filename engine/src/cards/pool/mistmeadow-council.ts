import { defineCard } from "../define.js";

// EDHREC rank 21584. Wizard's Retort's reduction: a Kithkin permanent of any
// type, a changeling included.

export default defineCard({
  name: "Mistmeadow Council",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kithkin", "Advisor"],
  power: 4,
  toughness: 3,
  text: "This spell costs {1} less to cast if you control a Kithkin.\nWhen this creature enters, draw a card.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Kithkin" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature enters, draw a card.",
    },
  ],
});
