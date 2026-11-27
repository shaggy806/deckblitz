import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

const COUNTER_TEXT = "Pay 2 life or {2}: Counter target red or green spell. Any player may activate this ability.";

export default defineCard({
  name: "Tidal Control",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${COUNTER_TEXT}`,
  triggered: [cumulativeUpkeep("{2}")],
  activated: [
    {
      // One of two whole costs, chosen as it's activated (rule 602.2b).
      cost: {
        mana: null,
        tap: false,
        options: [
          { cost: { payLife: 2 }, text: "Pay 2 life" },
          { cost: { mana: "{2}" }, text: "{2}" },
        ],
      },
      anyPlayer: true,
      targets: [{ kind: "spell", filter: { anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
