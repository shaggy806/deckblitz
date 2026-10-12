import { defineCard } from "../define.js";

const OPUS_TEXT =
  "Opus — Whenever you cast an instant or sorcery spell, target player mills three cards. If five or more mana was spent to cast that spell, that player mills ten cards instead.";

export default defineCard({
  name: "Exhibition Tidecaller",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn", "Wizard"],
  power: 0,
  toughness: 2,
  text: OPUS_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["player"],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } },
        then: { kind: "mill", target: 0, amount: 10 },
        else: { kind: "mill", target: 0, amount: 3 },
      },
      resolve: null,
      text: OPUS_TEXT,
    },
  ],
});
