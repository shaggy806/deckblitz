import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 25536.

export default defineCard({
  name: "Razor Golem",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  selfCostReduction: affinity({ subtype: "Plains" }),
  text: "Affinity for Plains (This spell costs {1} less to cast for each Plains you control.)\nVigilance",
});
