import { defineCard } from "../define.js";

export default defineCard({
  name: "Ravenous Cosmozoan",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: "This spell costs {1} less to cast for each noncreature, nonland card in your graveyard.\nFlying, haste",
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { notTypes: ["creature", "land"] } },
  },
});
