import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 101.
//
// Rulings:
//   [2025-10-02] Paying cumulative upkeep is always optional. If it's not paid, the permanent with
//     cumulative upkeep is sacrificed. Partial payments of the total cumulative upkeep cost can't
//     be made.
//
// Cumulative upkeep {1} is the helper's (all of it per age counter, or the
// sacrifice). The punisher is Rhystic Study's shape: the caster of the
// noncreature spell (`trigger-controller`) decides whether to pay {4}; if they
// don't, Mystic Remora's controller may draw.

const CAST_TEXT = "Whenever an opponent casts a noncreature spell, you may draw a card unless that player pays {4}.";

export default defineCard({
  name: "Mystic Remora",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${CAST_TEXT}`,
  triggered: [
    cumulativeUpkeep("{1}"),
    {
      trigger: { on: "cast-spell", who: "opponent", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ pay: "{4}", text: "Pay {4}" }],
        otherwise: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
