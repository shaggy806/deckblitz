import { defineCard } from "../define.js";

// EDHREC rank 1730.
//
// Rulings:
//   [2023-09-01] If multiple creatures enter the battlefield at one time, this ability triggers
//     once for each of those creatures.
//
// Back to Basics' "doesn't untap" restriction (rule 502.3) over every creature.

const STATIC_TEXT = "Creatures don't untap during their controllers' untap steps.";
const TRIGGER_TEXT = "Whenever a creature enters, untap all creatures.";

export default defineCard({
  name: "Intruder Alarm",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${STATIC_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      restrictions: ["doesnt-untap"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "untap-all", filter: { type: "creature" } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
