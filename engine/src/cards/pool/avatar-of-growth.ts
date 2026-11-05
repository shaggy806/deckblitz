import { defineCard } from "../define.js";

// EDHREC rank 11845.

export default defineCard({
  name: "Avatar of Growth",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Avatar"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { opponents: true },
  },
  text: "This spell costs {1} less to cast for each opponent you have.\nTrample\nWhen this creature enters, each player searches their library for up to two basic land cards, puts them onto the battlefield, then shuffles.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        choicesHeld: true,
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "battlefield",
          min: 0,
          max: 2,
          who: "that-player",
        },
      },
      resolve: null,
      text: "When this creature enters, each player searches their library for up to two basic land cards, puts them onto the battlefield, then shuffles.",
    },
  ],
});
