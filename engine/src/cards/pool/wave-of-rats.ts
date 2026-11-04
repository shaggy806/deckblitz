import { defineCard } from "../define.js";

// EDHREC rank 9935.
//
// Rulings:
//   [2022-04-29] If you pay the blitz cost to cast a creature spell, that permanent will be
//     sacrificed only if it's still on the battlefield when that triggered ability resolves. If it
//     dies or goes to another zone before then, it will stay where it is.
//   [2022-04-29] The triggered ability that lets its controller draw a card triggers when it dies
//     for any reason, not just when you sacrifice it during the end step.
//   [2022-04-29] If a creature enters the battlefield as a copy of or becomes a copy of a creature
//     whose blitz cost was paid, the copy won't have haste, won't be sacrificed, and its
//     controller won't draw a card when it dies.
//   [2022-04-29] You don't have to attack with the creature with blitz unless another ability says
//     you do.
//   [2022-04-29] If you choose to pay the blitz cost rather than the mana cost, you're still
//     casting the spell. It goes on the stack and can be responded to and countered. You can cast
//     a creature spell for its blitz cost only if you could cast that creature spell. Most of the
//     time, this means during your main phase when the stack is empty.

export default defineCard({
  name: "Wave of Rats",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 4,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nWhen this creature dies, if it dealt combat damage to a player this turn, return it to the battlefield under its owner's control.\nBlitz {4}{B} (If you cast this spell for its blitz cost, it gains haste and \"When this creature dies, draw a card.\" Sacrifice it at the beginning of the next end step.)",
  blitz: { cost: "{4}{B}" },
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      // This creature in the stint it died in, not an earlier one (rule 400.7).
      condition: { kind: "turn-history", what: "combat-damaged-by", who: "any-player", selfOnly: true },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object" },
      resolve: null,
      text: "When this creature dies, if it dealt combat damage to a player this turn, return it to the battlefield under its owner's control.",
    },
  ],
});
