import { defineCard } from "../define.js";

// EDHREC rank 10723.
//
// Rulings:
//   [2007-02-01] In the Two-Headed Giant format, you still only have to pay once per creature.
//   [2008-10-01] This has the supertype world. When a world permanent enters, any world permanents
//     that were already on the battlefield are put into their owners' graveyards. This is a
//     state-based action called the "world rule." The new world permanent stays on the
//     battlefield. If two world permanents enter at the same time, they're both put into their
//     owners' graveyards.
//   [2014-02-01] Unless some effect explicitly says otherwise, a creature that can't attack you
//     can still attack a planeswalker you control.
//
// The upkeep tax is Public Thoroughfare's shape: choose up to one untapped
// creature you control and tap it, or sacrifice this. The attack tax is
// Propaganda's.

const UPKEEP = "At the beginning of your upkeep, sacrifice this enchantment unless you tap an untapped creature you control.";
const TAX = "Creatures can't attack you unless their controller pays {2} for each creature they control that's attacking you.";

export default defineCard({
  name: "Koskun Falls",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${TAX}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you", tapped: false },
            upTo: 1,
            then: { kind: "tap", target: 0 },
            prompt: "Tap an untapped creature you control, or sacrifice Koskun Falls",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "tapped", atMost: 0 },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      attackTax: { generic: 2 },
      text: TAX,
    },
  ],
});
