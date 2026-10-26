import { defineCard } from "../define.js";

// Replicate (rule 702.56a): `kicker` with `keyword: "replicate"`, paid any
// number of times; one cast trigger copies it that many times.
//
// EDHREC rank 28498.
//
// Rulings:
//   [2006-02-01] The Mountain will remain a creature for the rest of the game. It doesn't have a
//     creature type.
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.
//   [2024-01-12] As the replicate triggered ability resolves, you'll copy Shattering Spree for
//     each time you paid its replicate cost, even if the original spell is no longer on the stack
//     at that time (perhaps because it was countered).
//   [2024-01-12] The copies that replicate creates are created on the stack, so they're not
//     "cast." Abilities that trigger when a player casts a spell won't trigger.

export default defineCard({
  name: "Siege of Towers",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Replicate {1}{R} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nTarget Mountain becomes a 3/1 creature. It's still a land.",
  kicker: { cost: "{1}{R}", keyword: "replicate", multi: true },
  // "Becomes a 3/1 creature" with no duration is for good (the 2006 ruling);
  // it has no creature type.
  targets: [{ kind: "permanent", filter: { subtype: "Mountain" } }],
  effect: {
    kind: "animate",
    target: 0,
    power: 3,
    toughness: 1,
    addTypes: ["creature"],
    addSubtypes: [],
    duration: "permanent",
  },
});
