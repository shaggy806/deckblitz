import { defineCard } from "../define.js";

// EDHREC rank 18251.

export default defineCard({
  name: "Fungal Colossus",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Beast"],
  power: 5,
  toughness: 5,
  text: "This spell costs {X} less to cast, where X is the number of differently named lands you control.",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
  },
});
