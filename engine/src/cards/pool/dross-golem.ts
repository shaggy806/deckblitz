import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 22097.

export default defineCard({
  name: "Dross Golem",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 2,
  keywords: ["fear"],
  selfCostReduction: affinity({ subtype: "Swamp" }),
  text: "Affinity for Swamps (This spell costs {1} less to cast for each Swamp you control.)\nFear (This creature can't be blocked except by artifact creatures and/or black creatures.)",
});
