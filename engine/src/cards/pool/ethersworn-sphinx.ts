import { defineCard } from "../define.js";

export default defineCard({
  name: "Ethersworn Sphinx",
  manaCost: "{7}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying\nCascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card with lesser mana value. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
});
