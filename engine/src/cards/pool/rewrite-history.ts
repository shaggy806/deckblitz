import { defineCard } from "../define.js";

// "One or more … become tapped" fires once per batch — an attack tapping
// several creatures at once is one (the batched `becomes-tapped`).
const TAPPED =
  "Whenever one or more creatures you control become tapped, draw a card, then discard a card and put a plan counter on this enchantment.";
const FOURTH =
  "When the fourth plan counter is put on this enchantment, sacrifice it. When you do, return up to two target instant and/or sorcery cards from your graveyard to your hand.";

export default defineCard({
  name: "Rewrite History",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Plan"],
  text: `${TAPPED}\n${FOURTH}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "you-control", filter: { type: "creature" }, batched: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          { kind: "add-counter", target: "source", counter: "plan", amount: 1 },
        ],
      },
      resolve: null,
      text: TAPPED,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "plan", nth: 4 },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "any-number",
              of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
              max: 2,
            },
          ],
          effect: { kind: "for-each-target", from: 0, effect: { kind: "return-to-hand", target: 0, from: "graveyard" } },
          text: "When you do, return up to two target instant and/or sorcery cards from your graveyard to your hand.",
        },
      },
      resolve: null,
      text: FOURTH,
    },
  ],
});
