import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP). EDHREC rank 31841.

const UNTAP_TEXT = "Snow permanents don't untap during their controllers' untap steps.";

export default defineCard({
  name: "Freyalise's Radiance",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${UNTAP_TEXT}`,
  triggered: [cumulativeUpkeep("{2}")],
  static: [
    {
      affects: { scope: "filter", filter: { supertype: "snow" } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
