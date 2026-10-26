import { defineCard } from "../define.js";

// EDHREC rank 15958.
//
// Rulings:
//   [2014-07-18] If you cast a copy of a card that’s a certain color, the appropriate Staff’s
//     ability will trigger. However, if you copy a spell on the stack without casting that copy,
//     it will not.
//   [2014-07-18] Most nonbasic lands don’t have basic land types, even if they produce colored
//     mana. For example, Caves of Koilos is neither a Plains nor a Swamp. Having one enter the
//     battlefield under your control won’t cause Staff of the Sun Magus’s ability to trigger.
//   [2014-07-18] Each of these artifacts cares about any land with the appropriate basic land
//     type. For example, Staff of the Sun Magus’s ability triggers when any land with the subtype
//     Plains enters the battlefield under your control, not just lands named Plains.
// One ability with two trigger events (`sameAbilityAs`).

const TEXT = "Whenever you cast a red spell or a Mountain you control enters, you gain 1 life.";

export default defineCard({
  name: "Staff of the Flame Magus",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Mountain" } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
