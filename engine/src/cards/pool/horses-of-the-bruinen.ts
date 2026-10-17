import { defineCard } from "../define.js";

// EDHREC rank 14548.
//
// Rulings:
//   [2023-06-16] Each player can have only one emblem named The Ring and only one Ring-bearer at a
//     time.
//   [2023-06-16] The Ring gains its abilities in order from top to bottom. Once it gains an
//     ability, it has that ability for the rest of the game.
//   [2023-06-16] As the Ring tempts you, you get an emblem named The Ring if you don't have one.
//     Then your emblem gains its next ability and you choose a creature you control to become (or
//     remain) your Ring-bearer.
//   [2023-06-16] The Ring can tempt you even if you don't control a creature. In this case,
//     abilities that trigger "whenever the Ring tempts you" will still trigger.
//   [2023-06-16] Each time the Ring tempts you, you must choose a creature if you control one.
//   [2023-06-16] Some spells and abilities that cause the Ring to tempt you may require targets.
//     If each target chosen is an illegal target as that spell or ability tries to resolve, it
//     won't resolve. The Ring won't tempt you.
//   [2023-06-16] If the creature you choose as your Ring-bearer was already your Ring-bearer, that
//     still counts as choosing that creature as your Ring-bearer for the purpose of abilities that
//     trigger "whenever you choose a creature as your Ring-bearer" or abilities that care about
//     which creature was chosen as your Ring-bearer.

export default defineCard({
  name: "Horses of the Bruinen",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to two target creatures to their owners' hands. Scry 1. The Ring tempts you.",
  // Calamitous Tide's "up to two target creatures": two optional slots, the
  // second another creature than the first, returned as one event.
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      { kind: "scry", amount: 1 },
      { kind: "the-ring-tempts-you" },
    ],
  },
});
