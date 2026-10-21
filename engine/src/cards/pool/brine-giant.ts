import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

export default defineCard({
  name: "Brine Giant",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 6,
  text: "Affinity for enchantments (This spell costs {1} less to cast for each enchantment you control.)",
  selfCostReduction: affinity({ type: "enchantment" }),
});
