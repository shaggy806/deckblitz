import { defineCard } from "../define.js";

// EDHREC rank 20184. Morningtide.
//
// Rulings:
//   [2008-04-01] Spells and abilities that prevent damage or regenerate the targeted creature must
//     be cast or activated before the creature type is chosen.
//   [2008-04-01] You choose a target for this spell as you cast it, but you don't choose a
//     creature type until the spell resolves.
//   [2008-04-01] Note that this spell counts the number of permanents you control of the chosen
//     type, not just the number of creatures you control. It will also take your kindred
//     permanents of the chosen type into account.
//
// The count is of permanents (no type clause), so a kindred permanent of the
// type counts (the third ruling).

export default defineCard({
  name: "Roar of the Crowd",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose a creature type. Roar of the Crowd deals damage to any target equal to the number of permanents you control of the chosen type.",
  targets: ["any-target"],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "damage",
      target: 0,
      amount: { countOf: { controlledBy: "you", subtype: "$chosen" } },
    },
  },
});
