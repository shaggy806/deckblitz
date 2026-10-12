import { defineCard } from "../define.js";

const OPUS_TEXT =
  "Opus — Whenever you cast an instant or sorcery spell, this creature deals 1 damage to each opponent. If five or more mana was spent to cast that spell, this creature deals 3 damage to each opponent instead.";

// Opus: the cast trigger reads what was spent on the spell, even once the
// spell has left the stack (the ruling — `trigger-object`'s `manaSpent`).
export default defineCard({
  name: "Thunderdrum Soloist",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Bard"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${OPUS_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } },
        then: { kind: "damage", amount: 3, who: "each-opponent" },
        else: { kind: "damage", amount: 1, who: "each-opponent" },
      },
      resolve: null,
      text: OPUS_TEXT,
    },
  ],
});
