import { defineCard } from "../define.js";

// EDHREC rank 23666.
//
// The target is chosen for the reflexive ability as it goes on the stack, not
// as this is activated (the ruling).

const CAST_TEXT = "Whenever you cast a noncreature spell, put an oil counter on this creature.";
const ACTIVATED_TEXT =
  "Remove three oil counters from this creature: Draw a card. Then you may discard a nonland card. When you discard a card this way, this creature deals 3 damage to target creature or planeswalker. Activate only as a sorcery.";

export default defineCard({
  name: "Serum-Core Chimera",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Chimera"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${CAST_TEXT}\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "oil", count: 3 } },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "may",
            prompt: "Discard a nonland card?",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard", target: "you", amount: 1, filter: { notTypes: ["land"] } },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "discarded" },
                  then: {
                    kind: "reflexive-trigger",
                    targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
                    effect: { kind: "damage", amount: 3, target: 0 },
                    text: "This creature deals 3 damage to target creature or planeswalker.",
                  },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
