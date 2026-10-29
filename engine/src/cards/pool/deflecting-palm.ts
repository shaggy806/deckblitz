import { defineCard } from "../define.js";

// EDHREC rank 1130.
//
// Rulings:
//   [2014-09-20] If multiple prevention and/or replacement effects are trying to apply to the same
//     damage, the player who would be dealt damage chooses the order in which to apply them.
//   [2014-09-20] Deflecting Palm doesn't target any permanent or player. You choose a source of
//     damage as Deflecting Palm resolves.

export default defineCard({
  name: "Deflecting Palm",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "The next time a source of your choice would deal damage to you this turn, prevent that damage. If damage is prevented this way, Deflecting Palm deals that much damage to that source's controller.",
  targets: [],
  effect: {
    kind: "prevent-damage-from-chosen-source",
    to: "you",
    amount: "next-time",
    then: { kind: "damage", amount: "x", who: "trigger-controller" },
  },
});
