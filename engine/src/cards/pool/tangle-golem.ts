import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// Darksteel. EDHREC rank 22405. Affinity for Forests (rule 702.41a): {1} less
// for each Forest you control.

export default defineCard({
  name: "Tangle Golem",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 5,
  toughness: 4,
  text: "Affinity for Forests (This spell costs {1} less to cast for each Forest you control.)",
  selfCostReduction: affinity({ subtype: "Forest" }),
});
