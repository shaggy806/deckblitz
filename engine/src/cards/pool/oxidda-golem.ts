import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

export default defineCard({
  name: "Oxidda Golem",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  selfCostReduction: affinity({ subtype: "Mountain" }),
  text: "Affinity for Mountains (This spell costs {1} less to cast for each Mountain you control.)\nHaste",
});
