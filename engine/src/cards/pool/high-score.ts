import { defineCard } from "../define.js";

// EDHREC rank 4803.
//
// Rulings:
//   [2026-01-27] In the case where you control more than one High Score, each one you control will
//     increase the number of +1/+1 counters placed on a creature you control by one.
//   [2026-01-27] If two or more effects attempt to modify how many counters would be put on a
//     creature you control, you choose the order to apply those effects, no matter who controls
//     the sources of those effects.
//   [2026-01-27] If a creature you control would enter the battlefield with a number of +1/+1
//     counters on it, it enters with that many plus one instead.
//
// Hardened Scales' replacement, and Thickest in the Thicket's end step: the
// draw's "if" isn't an intervening-if, so the ability always triggers and
// the question is asked as it resolves. "A creature with the greatest power"
// is satisfied by one tied for it (each tied creature has the greatest
// power) — `controls-greatest`.

const SCALES_TEXT =
  "If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on it instead.";
const END_TEXT =
  "At the beginning of your end step, draw a card if you control a creature with the greatest power among creatures on the battlefield.";

export default defineCard({
  name: "High Score",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${SCALES_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1", filter: { type: "creature" } },
      text: SCALES_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls-greatest", of: "power", filter: { type: "creature" } },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
