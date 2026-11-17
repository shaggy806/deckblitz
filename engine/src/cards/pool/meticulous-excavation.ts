import { defineCard } from "../define.js";

// EDHREC rank 14009.
//
// Rulings:
//   If the target permanent has unearth and was put onto the battlefield using its unearth
//     ability, this effect can still exile it and return it to its owner's hand.
//   If a permanent returned to the battlefield with unearth would leave the battlefield for any
//     reason, it's exiled instead—unless the spell or ability that's causing the permanent to
//     leave the battlefield is actually trying to exile it!

const TEXT =
  "{2}{W}: Return target permanent you control to its owner's hand. If it has unearth, instead exile it, then return that card to its owner's hand. Activate only during your turn.";

export default defineCard({
  name: "Meticulous Excavation",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      condition: { kind: "your-turn" },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      // Exiling it gets past unearth's "exile it instead" (the ruling): the
      // card then goes from exile to its owner's hand.
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { hasKeyword: "unearth" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            { kind: "return-to-hand", target: 0, from: "exile" },
          ],
        },
        else: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
