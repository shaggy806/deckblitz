import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 29947.
export default defineCard({
  name: "Dusk Feaster",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Delirium — This spell costs {2} less to cast if there are four or more card types among cards in your graveyard.\nFlying",
  selfCostReduction: { condition: { kind: "delirium" }, reduceGeneric: 2 },
});
