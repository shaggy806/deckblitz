import { defineCard } from "../define.js";

// The creature is chosen at random, not targeted (a hexproof one can be), and
// nothing can happen between the choice and the destruction (the rulings):
// one resolution, the chosen one at slot 0 and each other creature in turn at
// slot 1, destroyed together.
export default defineCard({
  name: "Last One Standing",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Choose a creature at random, then destroy the rest.",
  targets: [],
  effect: {
    kind: "choose-permanents",
    random: true,
    filter: { type: "creature" },
    upTo: 1,
    prompt: "A creature, at random",
    then: {
      kind: "for-each-permanent",
      filter: { type: "creature" },
      as: 1,
      exceptTarget: 0,
      simultaneous: true,
      effect: { kind: "destroy", target: 1 },
    },
  },
});
