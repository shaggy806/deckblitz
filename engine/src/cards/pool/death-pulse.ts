import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 28107.
//
// Rulings:
//   [2022-12-08] When you cycle this card, first the cycling ability goes on the stack, then the
//     triggered ability goes on the stack on top of it. The triggered ability will resolve before
//     you draw a card from the cycling ability.
//   [2022-12-08] You can cycle this card even if there are no legal targets for the triggered
//     ability.
//   [2022-12-08] The cycling ability and the triggered ability are separate. If the triggered
//     ability doesn't resolve, the cycling ability will still resolve, and you'll draw a card.

const CYCLE_TEXT = "When you cycle this card, you may have target creature get -1/-1 until end of turn.";

export default defineCard({
  name: "Death Pulse",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  cycling: { cost: "{1}{B}{B}" },
  text: `Target creature gets -4/-4 until end of turn.\nCycling {1}{B}{B} ({1}{B}{B}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get -1/-1 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
