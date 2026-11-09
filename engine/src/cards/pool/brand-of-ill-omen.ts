import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

export default defineCard({
  name: "Brand of Ill Omen",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nCumulative upkeep {R} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nEnchanted creature's controller can't cast creature spells.",
  targets: ["creature"],
  triggered: [cumulativeUpkeep("{R}")],
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "cast", who: "enchanted-controller", filter: { type: "creature" } }], text: "Enchanted creature's controller can't cast creature spells." }],
});
