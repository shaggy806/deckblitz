import { defineCard } from "../define.js";

// EDHREC rank 9638.
//
// Rulings:
//   [2025-07-25] Uthros Psionicist's ability will count any spells you've cast this turn, which
//     may include Uthros Psionicist itself. If Uthros Psionicist was the first spell you cast this
//     turn, the next spell you cast this turn is your second spell.
//
// Highspire Bell-Ringer's shape: a spell's cost is worked out before it
// becomes cast (rules 601.2f, 601.2i), so "the second spell" is the one cast
// while exactly one other has been cast this turn.

const TEXT = "The second spell you cast each turn costs {2} less to cast.";

export default defineCard({
  name: "Uthros Psionicist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish", "Scientist"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 1, atMost: 1 },
      costModification: { applies: {}, caster: "you", reduceGeneric: 2 },
      text: TEXT,
    },
  ],
});
