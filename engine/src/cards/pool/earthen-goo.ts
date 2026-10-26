import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP). EDHREC rank 31866. "{R} or {G}" per age counter is a
// hybrid {R/G} per counter: each counter's payment may be either colour.
//
// Rulings:
//   [2008-10-01] Paying cumulative upkeep is always optional. If it's not paid, the permanent with
//     cumulative upkeep is sacrificed. Partial payments of the total cumulative upkeep cost can't
//     be made.

const UPKEEP_TEXT =
  "Cumulative upkeep {R} or {G} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";

export default defineCard({
  name: "Earthen Goo",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${UPKEEP_TEXT}\nThis creature gets +1/+1 for each age counter on it.`,
  triggered: [{ ...cumulativeUpkeep("{R/G}"), text: UPKEEP_TEXT }],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { countersOnSource: "age", pt: [1, 1] },
      text: "This creature gets +1/+1 for each age counter on it.",
    },
  ],
});
