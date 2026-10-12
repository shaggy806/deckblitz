import { defineCard } from "../define.js";

const OPUS_TEXT =
  "Opus — Whenever you cast an instant or sorcery spell, draw a card. Then discard a card unless five or more mana was spent to cast that spell.";

export default defineCard({
  name: "Muse Seeker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 1,
  toughness: 2,
  text: OPUS_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } } },
            then: { kind: "discard", target: "you", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: OPUS_TEXT,
    },
  ],
});
