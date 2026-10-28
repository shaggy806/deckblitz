import { defineCard } from "../define.js";

// EDHREC rank 20464.
//
// Rulings:
//   [2011-09-22] A "non-Human creature" is any creature that doesn't have the creature type Human.
//     A creature that is a Human in addition to other creature types is not a non-Human creature.
//   [2011-09-22] Only creatures you control when Spare from Evil resolves will be affected.
//     Creatures that enter or that you gain control of later in the turn won't be.

export default defineCard({
  name: "Spare from Evil",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control gain protection from non-Human creatures until end of turn.",
  targets: [],
  effect: {
    kind: "grant-protection",
    filter: { type: "creature", controlledBy: "you" },
    from: { filter: { type: "creature", notSubtypes: ["Human"] } },
    duration: "end-of-turn",
  },
});
