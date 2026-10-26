import { defineCard } from "../define.js";

// EDHREC rank 29935. Shards of Alara.
//
// Rulings:
//   [2022-12-08] When you cycle this card, first the cycling ability goes on the stack, then the
//     triggered ability goes on the stack on top of it.
//   [2022-12-08] You can cycle this card even if there are no legal targets for the triggered
//     ability.

export default defineCard({
  name: "Resounding Silence",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{5}{G}{W}{U}" },
  text: "Exile target attacking creature.\nCycling {5}{G}{W}{U} ({5}{G}{W}{U}, Discard this card: Draw a card.)\nWhen you cycle this card, exile up to two target attacking creatures.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: { kind: "exile", target: 0 },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [
        { kind: "any-number", of: { kind: "permanent", filter: { attacking: true, type: "creature" } }, max: 2 },
      ],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
      resolve: null,
      text: "When you cycle this card, exile up to two target attacking creatures.",
    },
  ],
});
