import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

export default defineCard({
  name: "Sky-Blessed Samurai",
  manaCost: "{6}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Samurai"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Affinity for enchantments (This spell costs {1} less to cast for each enchantment you control.)\nFlying",
  selfCostReduction: affinity({ type: "enchantment" }),
});
