import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

export default defineCard({
  name: "Spire Golem",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  selfCostReduction: affinity({ subtype: "Island" }),
  text: "Affinity for Islands (This spell costs {1} less to cast for each Island you control.)\nFlying",
});
