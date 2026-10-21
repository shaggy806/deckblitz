import { defineCard } from "../define.js";

// EDHREC rank 8315.
//
// Rulings:
//   [2019-06-14] If Aria of Flame leaves the battlefield while its last ability is on the stack,
//     use the number of verse counters it had on it immediately before it left the battlefield to
//     determine how much damage it deals.
//   [2019-06-14] Aria of Flame's last ability resolves before the spell that caused it to trigger.
//     It resolves even if that spell is countered.
//   [2019-06-14] If the target player or planeswalker is an illegal target by the time Aria of
//     Flame's last ability tries to resolve, the ability doesn't resolve. You don't put a verse
//     counter on Aria of Flame.
// `countersOn: "source"` reads the last-known counters once Aria has left
// (the first ruling); the add-counter then finds nothing to put a counter on.

const ETB_TEXT = "When this enchantment enters, each opponent gains 10 life.";
const CAST_TEXT =
  "Whenever you cast an instant or sorcery spell, put a verse counter on this enchantment, then it deals damage equal to the number of verse counters on it to target player or planeswalker.";

export default defineCard({
  name: "Aria of Flame",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ETB_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 10, who: "each-opponent" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
          { kind: "damage", amount: { countersOn: "source", counter: "verse" }, target: 0 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
