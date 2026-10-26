import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Weatherlight (WTH). EDHREC rank 29929.
//
// Mana value exactly equal to the age counters (its ruling), read as the
// draw-step trigger resolves — Blast Zone's shape. Sacrificed for an unpaid
// upkeep, it's gone before the draw step and destroys nothing (its ruling).

const DRAW_TEXT =
  "At the beginning of your draw step, destroy each creature with mana value equal to the number of age counters on this enchantment. They can't be regenerated.";

const upkeep = cumulativeUpkeep("{1}");

export default defineCard({
  name: "Wave of Terror",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${upkeep.text}\n${DRAW_TEXT}`,
  triggered: [
    upkeep,
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: {
          type: "creature",
          manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "age" } } },
        },
        cantBeRegenerated: true,
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
