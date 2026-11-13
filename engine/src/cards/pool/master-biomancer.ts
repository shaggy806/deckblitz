import { defineCard } from "../define.js";

// EDHREC rank 3256.
// Rulings:
//   [2013-01-24] To determine how many additional +1/+1 counters a creature enters with, use
//     Master Biomancer's power as that creature is entering.
//
// A replacement over other creatures entering (rule 614.12): the counters and
// the Mutant subtype are both in place as each enters, and the subtype lasts
// after the Biomancer is gone (rule 611.2c).

const TEXT =
  "Each other creature you control enters with a number of additional +1/+1 counters on it equal to this creature's power and as a Mutant in addition to its other types.";

export default defineCard({
  name: "Master Biomancer",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: { powerOf: "source" } },
        enterAs: { addSubtypes: ["Mutant"] },
      },
      text: TEXT,
    },
  ],
});
