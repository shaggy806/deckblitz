import { defineCard } from "../define.js";

// EDHREC rank 27471.
//
// Rulings:
//   [2014-11-24] If Frost Walker becomes the target of a spell or ability, its ability triggers
//     and is put on the stack on top of that spell or ability. Frost Walker’s ability will resolve
//     (causing it to be sacrificed) first. Unless the spell or ability has another target, it
//     won’t resolve as it tries to resolve for having no legal targets.

export default defineCard({
  name: "Frost Walker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 1,
  text: "When this creature becomes the target of a spell or ability, sacrifice it.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When this creature becomes the target of a spell or ability, sacrifice it.",
    },
  ],
});
