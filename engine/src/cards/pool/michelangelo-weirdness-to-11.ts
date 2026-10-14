import { defineCard } from "../define.js";

// EDHREC rank 4863.
// Makes Mutagen → use "Mutagen Token".
//
// Rulings:
//   [2026-01-27] If a creature you control would enter the battlefield with a number of +1/+1
//     counters on it, it enters with that many plus one instead.
//   [2026-01-27] If two or more effects attempt to modify how many counters would be put on a
//     creature you control, you choose the order to apply those effects, no matter who controls
//     the sources of those effects.
//   [2026-01-27] Mutagen tokens are a kind of predefined token. Each one is a colorless artifact
//     with the artifact subtype Mutagen and the ability "{1}, {T}, Sacrifice this token: Put a
//     +1/+1 counter on target creature. Activate only as a sorcery."
//   [2026-01-27] In the unusual case where you control more than one Michelangelo, Weirdness to
//     11, each one you control will increase the number of +1/+1 counters placed on a creature you
//     control by one.
//   [2026-01-27] Some spells and abilities that create Mutagen tokens require targets. If each
//     target chosen is an illegal target as that spell or ability tries to resolve, it won't
//     resolve. The Mutagen token won't be created.

export default defineCard({
  name: "Michelangelo, Weirdness to 11",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 1,
  toughness: 1,
  text: "When Michelangelo enters, create a Mutagen token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")\nIf one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on it instead.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: "When Michelangelo enters, create a Mutagen token.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1", filter: { type: "creature" } },
      text: "If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on it instead.",
    },
  ],
});
