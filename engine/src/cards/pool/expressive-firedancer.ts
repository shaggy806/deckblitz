import { defineCard } from "../define.js";

// EDHREC rank 22273. Opus: the pump always, double strike on top of it when
// five or more mana was spent on the spell (the trigger resolves before it,
// the ruling).
const OPUS_TEXT =
  "Opus — Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn. If five or more mana was spent to cast that spell, this creature also gains double strike until end of turn.";

export default defineCard({
  name: "Expressive Firedancer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Sorcerer"],
  power: 2,
  toughness: 2,
  text: OPUS_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } },
            then: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: OPUS_TEXT,
    },
  ],
});
