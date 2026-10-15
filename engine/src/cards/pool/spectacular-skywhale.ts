import { defineCard } from "../define.js";

// EDHREC rank 19067.
//
// Opus (Thunderdrum Soloist's shape): the "instead" is a conditional on the
// mana spent on the spell, read as it was on the stack if it has left since.
//
// Rulings:
//   [2026-03-20] An opus ability resolves before the spell that caused it to trigger. It resolves
//     even if that spell is countered or otherwise leaves the stack.

const OPUS_TEXT =
  "Opus — Whenever you cast an instant or sorcery spell, this creature gets +3/+0 until end of turn. If five or more mana was spent to cast that spell, put three +1/+1 counters on this creature instead.";

export default defineCard({
  name: "Spectacular Skywhale",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Whale"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${OPUS_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
        else: { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: OPUS_TEXT,
    },
  ],
});
