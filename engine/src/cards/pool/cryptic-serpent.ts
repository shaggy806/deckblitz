import { defineCard } from "../define.js";

export default defineCard({
  name: "Cryptic Serpent",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 6,
  toughness: 5,
  text: "This spell costs {1} less to cast for each instant and sorcery card in your graveyard.",
  // Generic only, so never below {U}{U}; a card that's both an instant and a
  // sorcery (a split card) is one card and counts once (the rulings).
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { typesAnyOf: ["instant", "sorcery"] } },
  },
});
