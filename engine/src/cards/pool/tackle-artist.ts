import { defineCard } from "../define.js";

// EDHREC rank 18821.
//
// Opus (Thunderdrum Soloist's shape): the "instead" is a conditional on the
// mana spent on the spell, read as it was on the stack if it has left since.
//
// Rulings:
//   [2026-03-20] An opus ability resolves before the spell that caused it to trigger. It resolves
//     even if that spell is countered or otherwise leaves the stack.

const OPUS_TEXT =
  "Opus — Whenever you cast an instant or sorcery spell, put a +1/+1 counter on this creature. If five or more mana was spent to cast that spell, put two +1/+1 counters on this creature instead.";

export default defineCard({
  name: "Tackle Artist",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Sorcerer"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${OPUS_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
        else: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: OPUS_TEXT,
    },
  ],
});
