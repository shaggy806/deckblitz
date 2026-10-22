import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Ice Age (ICE). EDHREC rank 31574.

const SNAP_TEXT =
  "At the beginning of each player's upkeep, this enchantment deals damage to that player equal to the number of snow lands they control.";

export default defineCard({
  name: "Cold Snap",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${SNAP_TEXT}`,
  triggered: [
    cumulativeUpkeep("{2}"),
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "damage",
        amount: { countOf: { type: "land", supertype: "snow", controlledBy: "active-player" } },
        who: "active-player",
      },
      resolve: null,
      text: SNAP_TEXT,
    },
  ],
});
