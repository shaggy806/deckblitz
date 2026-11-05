import { defineCard } from "../define.js";

// EDHREC rank 28766.

export default defineCard({
  name: "Merchant Ship",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 0,
  toughness: 2,
  text: "This creature can't attack unless defending player controls an Island.\nWhenever this creature attacks and isn't blocked, you gain 2 life.\nWhen you control no Islands, sacrifice this creature.",
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "Whenever this creature attacks and isn't blocked, you gain 2 life.",
    },
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no Islands, sacrifice this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Island" } },
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});
