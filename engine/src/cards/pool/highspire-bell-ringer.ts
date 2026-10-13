import { defineCard } from "../define.js";

// EDHREC rank 10949.
//
// Rulings:
//   [2025-04-04] Spells that were cast before Highspire Bell-Ringer entered the battlefield count.
//     If Highspire Bell-Ringer was the first spell you cast this turn, the next spell you cast this
//     turn is your second spell.
//   [2025-04-04] Highspire Bell-Ringer can't reduce its own cost, even if it's the second spell
//     you cast in a turn.
//   [2025-04-04] Highspire Bell-Ringer's cost-reduction ability can only reduce the generic mana
//     component of the cost you pay for a spell.
//
// A spell's cost is worked out before it becomes cast (rules 601.2f, 601.2i),
// so "the second spell" is the one cast while exactly one other has been cast
// this turn — every spell counted, ones cast before this entered included.

const TEXT = "The second spell you cast each turn costs {1} less to cast.";

export default defineCard({
  name: "Highspire Bell-Ringer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn", "Monk"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 1, atMost: 1 },
      costModification: { applies: {}, caster: "you", reduceGeneric: 1 },
      text: TEXT,
    },
  ],
});
