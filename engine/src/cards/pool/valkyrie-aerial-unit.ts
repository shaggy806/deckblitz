import { defineCard } from "../define.js";

export default defineCard({
  name: "Valkyrie Aerial Unit",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying\nWhen this creature enters, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: "When this creature enters, surveil 2.",
    },
  ],
});
