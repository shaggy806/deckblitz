import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 31874. Coldsnap. Protection from snow is a supertype filter
// (rule 702.16): no targeting by snow sources, no snow Auras, no blocks by
// snow creatures, damage from snow sources prevented.

export default defineCard({
  name: "Ronom Hulk",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 6,
  text: "Protection from snow\nCumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
  triggered: [cumulativeUpkeep("{1}")],
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { supertype: "snow" } },
      text: "Protection from snow",
    },
  ],
});
