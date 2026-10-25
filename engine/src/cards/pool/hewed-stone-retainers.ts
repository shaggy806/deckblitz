import { defineCard } from "../define.js";

// EDHREC rank 29952.
//
// Rulings:
//   [2014-11-24] It doesn’t matter whether the other spell resolved. It could have been countered
//     or, if you’ve somehow cast Hewed Stone Retainers as though it had flash, it could still be
//     on the stack.

export default defineCard({
  name: "Hewed Stone Retainers",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  text: "Cast this spell only if you've cast another spell this turn.",
  // Checked before this spell is cast, so the spells already counted are
  // all "another" spell.
  castOnlyIf: { kind: "cast-this-turn", who: "you", atLeast: 1 },
});
