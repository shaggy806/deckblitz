import { defineCard } from "../define.js";

// EDHREC rank 13205.
//
// Rulings:
//   - It cares about the color of the snow mana, not just that snow mana was
//     spent; it doesn't matter which part of the total cost it paid.
//   - The creature enters with only one additional +1/+1 counter, however much
//     snow mana of its colors was spent.
//
// - The intervening "if" (rule 603.4) is a `trigger-object` condition, asked as
//   it triggers and again as it resolves: a `manaSpent` clause counting mana
//   from a snow source (rule 107.4h) of one of the spell's own colors as it is
//   (`ofItsColors`, rule 105.2) — so a colourless {S} or one of another colour
//   doesn't count.
// - "That creature enters with an additional +1/+1 counter" is Chocobo Camp's
//   `enters-with-counters` on the trigger object, the spell.
const TRIGGER_TEXT =
  "Whenever you cast a creature spell, if {S} of any of that spell's colors was spent to cast it, that creature enters with an additional +1/+1 counter on it. ({S} is mana from a snow source.)";

export default defineCard({
  name: "Boreal Outrider",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 2,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      condition: {
        kind: "trigger-object",
        filter: { manaSpent: [{ from: { supertype: "snow" }, ofItsColors: true }] },
      },
      targets: [],
      effect: { kind: "enters-with-counters", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
