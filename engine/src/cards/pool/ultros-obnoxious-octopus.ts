import { defineCard } from "../define.js";

// EDHREC rank 14666. The Emperor of Palamecia's "if at least N mana was spent
// to cast it" — the spell's mana spent can't change, so it's the trigger's
// filter.
// Rulings:
//   [2025-06-06] Each of Ultros's abilities resolves before the spell that caused it to trigger.
//     It resolves even if that spell is countered or otherwise leaves the stack.

const STUN_TEXT =
  "Whenever you cast a noncreature spell, if at least four mana was spent to cast it, tap target creature an opponent controls and put a stun counter on it.";
const GROW_TEXT =
  "Whenever you cast a noncreature spell, if at least eight mana was spent to cast it, put eight +1/+1 counters on Ultros.";

export default defineCard({
  name: "Ultros, Obnoxious Octopus",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 2,
  toughness: 1,
  text: `${STUN_TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"], manaSpent: { op: "gte", n: 4 } } },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: STUN_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"], manaSpent: { op: "gte", n: 8 } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 8 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
