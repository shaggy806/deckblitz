import { defineCard } from "../define.js";

// EDHREC rank 26740.
//
// Rulings:
//   [2014-04-26] Quarry Colossus's ability is mandatory. If you control the only creatures when
//     that ability triggers, you must choose a creature you control (which could be Quarry
//     Colossus itself) as the target.
//   [2014-04-26] If there are fewer than X cards in that player's library, put the creature on the
//     bottom of that library.
//   [2014-04-26] The value of X is determined as the ability resolves. If you control no Plains at
//     that time, put the creature on top of that library.

const TEXT =
  "When this creature enters, put target creature into its owner's library just beneath the top X cards of that library, where X is the number of Plains you control.";

export default defineCard({
  name: "Quarry Colossus",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "put-on-library",
        target: 0,
        position: { beneathTop: { countOf: { subtype: "Plains", controlledBy: "you" } } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
