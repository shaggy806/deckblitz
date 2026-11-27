import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Ice Age (ICE). EDHREC rank 27310.
//
// The granted cumulative upkeep is each green creature's own (Mana Chains'
// shape over a filter): it triggers on that creature's controller's upkeep,
// the age counters go on the creature and that player pays or sacrifices it.
// The counters stay if the creature stops being green or Breath of Dreams
// leaves; only the ability goes (rule 702.24a).

const STATIC_TEXT = 'Green creatures have "Cumulative upkeep {1}."';

export default defineCard({
  name: "Breath of Dreams",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `Cumulative upkeep {U} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${STATIC_TEXT}`,
  triggered: [cumulativeUpkeep("{U}")],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"] } },
      grantsTriggered: [cumulativeUpkeep("{1}")],
      text: STATIC_TEXT,
    },
  ],
});
