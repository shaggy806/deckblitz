import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Weatherlight (WTH). EDHREC rank 23521.
//
// The cumulative upkeep is the creature's own (granted — Decomposition's
// shape), so it triggers on its controller's upkeep, the age counters go on
// the creature and that player pays or sacrifices it. Each instance of
// cumulative upkeep counts every age counter on it (its ruling, 702.24b).

const STATIC_TEXT = 'Enchanted creature has "Cumulative upkeep {1}."';

export default defineCard({
  name: "Mana Chains",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT} (At the beginning of its controller's upkeep, that player puts an age counter on it, then sacrifices it unless they pay its upkeep cost for each age counter on it.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [cumulativeUpkeep("{1}")],
      text: STATIC_TEXT,
    },
  ],
});
