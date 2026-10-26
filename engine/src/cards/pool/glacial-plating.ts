import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP). EDHREC rank 20491.

export default defineCard({
  name: "Glacial Plating",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["snow"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nCumulative upkeep {S} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it. {S} can be paid with one mana from a snow source.)\nEnchanted creature gets +3/+3 for each age counter on this Aura.",
  targets: ["creature"],
  triggered: [cumulativeUpkeep("{S}")],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "age", pt: [3, 3] },
      text: "Enchanted creature gets +3/+3 for each age counter on this Aura.",
    },
  ],
});
