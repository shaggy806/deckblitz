import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

// EDHREC rank 6096.
//
// Rulings:
//   [2021-06-18] If there are no creatures on the battlefield when Out of Time's triggered ability
//     resolves, nothing phases out and Out of Time won't get any time counters. It will remain on
//     the battlefield and won't be sacrificed, since the last time counter will never be removed.
//   [2021-06-18] If Out of Time leaves the battlefield before its enter the battlefield trigger
//     resolves, creatures will untap, but they won't phase out.
//   [2021-06-18] A creature phased out by Out of Time doesn't phase in during its controller's
//     untap step as normal.
//
// "Those creatures" are all creatures, the ones the untap was about. The
// phasing is Oubliette's `untilSourceLeaves` (rule 610.4), which phases nothing
// out once the source has left. Vanishing has no number (rule 702.63b): the
// only time counters are the ones this puts on.
const ENTER_TEXT =
  "When this enchantment enters, untap all creatures, then those creatures phase out until this enchantment leaves the battlefield. Put a time counter on this enchantment for each creature that phased out this way.";

export default defineCard({
  name: "Out of Time",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\nVanishing (At the beginning of your upkeep, remove a time counter from this enchantment. When the last is removed, sacrifice it.)`,
  static: [...vanishing().static],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap-all", filter: { type: "creature" } },
          { kind: "phase-out", filter: { type: "creature" }, untilSourceLeaves: true },
          {
            kind: "add-counter",
            target: "source",
            counter: "time",
            amount: { thisWay: "phased-out", filter: { type: "creature" } },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    ...vanishing().triggered,
  ],
});
