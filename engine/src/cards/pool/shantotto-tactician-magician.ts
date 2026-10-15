import { defineCard } from "../define.js";

// EDHREC rank 9831.
//
// Rulings:
//   [2025-06-06] Shantotto's ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack.
//
// X is the mana spent on that spell, read from the stack even once it's gone
// (Aberrant Manawurm's amount; the `trigger-object` condition reads what was
// spent there for a spell countered in response — Opus's shape).
const TEXT =
  "Whenever you cast a noncreature spell, Shantotto gets +X/+0 until end of turn, where X is the amount of mana spent to cast that spell. If X is 4 or more, draw a card.";

export default defineCard({
  name: "Shantotto, Tactician Magician",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Wizard"],
  power: 0,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: { manaSpentOf: "trigger-object" },
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 4 } } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
