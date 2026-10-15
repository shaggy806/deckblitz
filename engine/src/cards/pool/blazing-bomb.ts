import { defineCard } from "../define.js";

// EDHREC rank 15685.
//
// The Emperor of Palamecia's "at least four mana was spent" cast trigger (a
// filter on the spell, checked as it's cast). "Blow Up" is an ability word;
// "it" is this creature, sacrificed to pay the cost, so its power is read as
// it last existed on the battlefield (the ruling) — Wall of Limbs' shape.
//
// Rulings:
//   [2025-06-06] Use Blazing Bomb's power as it last existed on the battlefield to determine how
//     much damage its last ability deals.
//   [2025-06-06] Blazing Bomb's first ability resolves before the spell that caused it to trigger.
//     It resolves even if that spell is countered or otherwise leaves the stack.

const CAST_TEXT =
  "Whenever you cast a noncreature spell, if at least four mana was spent to cast it, put a +1/+1 counter on this creature.";
const BLOW_TEXT =
  "Blow Up — {T}, Sacrifice this creature: It deals damage equal to its power to target creature. Activate only as a sorcery.";

export default defineCard({
  name: "Blazing Bomb",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  text: `${CAST_TEXT}\n${BLOW_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"], manaSpent: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: BLOW_TEXT,
      sorcerySpeed: true,
    },
  ],
});
