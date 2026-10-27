import { defineCard } from "../define.js";

// EDHREC rank 8522.
// Rulings:
//   [2018-03-16] A mana cost of {X}{X} means that you pay twice X. If you want X to be 3, you pay
//     {8}{W}{W} to cast Decree of Justice.
//   [2022-12-08] The cycling ability and the triggered ability are separate. If the triggered
//     ability doesn't resolve, the cycling ability will still resolve, and you'll draw a card.
//   [2022-12-08] When you cycle this card, first the cycling ability goes on the stack, then the
//     triggered ability goes on the stack on top of it. The triggered ability will resolve before
//     you draw a card from the cycling ability.

export default defineCard({
  name: "Decree of Justice",
  manaCost: "{X}{X}{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  cycling: { cost: "{2}{W}" },
  text: "Create X 4/4 white Angel creature tokens with flying.\nCycling {2}{W} ({2}{W}, Discard this card: Draw a card.)\nWhen you cycle this card, you may pay {X}. If you do, create X 1/1 white Soldier creature tokens.",
  effect: { kind: "create-token", token: "4/4 Angel Token", count: "x" },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to create X 1/1 white Soldier creature tokens?",
        cost: "{X}",
        effect: { kind: "create-token", token: "Soldier Token", count: "x" },
      },
      resolve: null,
      text: "When you cycle this card, you may pay {X}. If you do, create X 1/1 white Soldier creature tokens.",
    },
  ],
});
