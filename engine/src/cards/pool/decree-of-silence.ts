import { defineCard } from "../define.js";

// Rulings:
//   [2022-12-08] The cycling ability and the triggered ability are separate. If the triggered
//     ability doesn't resolve, the cycling ability will still resolve, and you'll draw a card.
//   [2022-12-08] You can cycle this card even if there are no legal targets for the triggered
//     ability.
//   [2022-12-08] When you cycle this card, first the cycling ability goes on the stack, then the
//     triggered ability goes on the stack on top of it.

const SILENCE_TEXT =
  "Whenever an opponent casts a spell, counter that spell and put a depletion counter on this enchantment. " +
  "If there are three or more depletion counters on this enchantment, sacrifice it.";

export default defineCard({
  name: "Decree of Silence",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  cycling: { cost: "{4}{U}{U}" },
  text: `${SILENCE_TEXT}\nCycling {4}{U}{U} ({4}{U}{U}, Discard this card: Draw a card.)\nWhen you cycle this card, you may counter target spell.`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "counter", target: "trigger-object" },
          { kind: "add-counter", target: "source", counter: "depletion", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "depletion", compare: { op: "gte", n: 3 } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: SILENCE_TEXT,
    },
    {
      trigger: { on: "this-cycled" },
      targets: ["spell"],
      effect: {
        kind: "may",
        prompt: "Counter target spell?",
        effect: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "When you cycle this card, you may counter target spell.",
    },
  ],
});
