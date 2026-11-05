import { defineCard } from "../define.js";

// EDHREC rank 26959.
//
// Rulings:
//   [2004-12-01] Yes, this card's base power/toughness is -1/-1. If it has five +1/+1 counters on
//     it, it's a 4/4 creature.
//   [2004-12-01] If Spinal Parasite is a 1/1 because it has two +1/+1 counters on it, you can
//     remove both counters to pay for its activated ability.
//   [2004-12-01] Any permanent is a legal target for Spinal Parasite's ability, not just one with
//     a counter on it. The player who controls Spinal Parasite chooses which counter to remove
//     from the targeted permanent.
//
// Sunburst on a creature is +1/+1 counters for each colour spent (Arcbound
// Wanderer's replacement). The counter removed is one of the controller's
// choice of kind (`remove-counters`, `counter: "any"`).
const SUNBURST_TEXT =
  "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)";
const REMOVE_TEXT = "Remove two +1/+1 counters from this creature: Remove a counter from target permanent.";

export default defineCard({
  name: "Spinal Parasite",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: -1,
  toughness: -1,
  text: `${SUNBURST_TEXT}\n${REMOVE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } },
      },
      text: SUNBURST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 2 } },
      targets: ["permanent"],
      effect: { kind: "remove-counters", target: 0, counter: "any", count: 1 },
      resolve: null,
      text: REMOVE_TEXT,
    },
  ],
});
