import { defineCard } from "../define.js";

// The Hobbit (HOB). EDHREC rank 6715.
//
// Rulings:
//   [2026-06-29] If the creature spell has {X} in its mana cost, use the value chosen for X when
//     calculating that spell's mana value.
//
// "That spell's mana value" is the trigger spell's, {X} included — and as it
// last was on the stack if it's been countered in response (rule 608.2h).

const COUNTERS_TEXT =
  "Whenever you cast a creature spell, put X +1/+1 counters on target creature you control, where X is that spell's mana value.";
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, create a 2/2 green Bear creature token.";

export default defineCard({
  name: "Dancing from Dark to Dawn",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${COUNTERS_TEXT}\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { manaValueOf: "trigger-object" } },
      resolve: null,
      text: COUNTERS_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Bear Token", count: 1 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
