import { defineCard } from "../define.js";

// EDHREC rank 12993.
//
// Clash (rule 701.30) first, then the return: on a win, the creature may go
// on top of its owner's library instead of into their hand.
//
// Rulings:
//   [2007-10-01] If you clash with the owner of the targeted creature and win, the owner of the
//     creature decides where to put to card revealed during the clash before you decide whether to
//     put the creature on top of that library. You know the player's decision before you make your
//     decision.
//   [2007-10-01] You choose the target when you play Whirlpool Whelm, not when you clash.
//   [2007-10-01] If you don't win the clash, the targeted creature always goes to its owner's
//     hand. If you win the clash, you choose whether the creature goes to its owner's hand or the
//     top of its owner's library.

export default defineCard({
  name: "Whirlpool Whelm",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  targets: ["creature"],
  effect: {
    kind: "clash",
    won: {
      kind: "may",
      prompt: "Put that creature on top of its owner's library instead?",
      effect: { kind: "put-on-library", target: 0, position: "top" },
      else: { kind: "return-to-hand", target: 0 },
    },
    lost: { kind: "return-to-hand", target: 0 },
  },
  text: "Clash with an opponent, then return target creature to its owner's hand. If you win, you may put that creature on top of its owner's library instead. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
});
