import { defineCard } from "../define.js";

// EDHREC rank 25085.
//
// Rulings:
//   [2008-04-01] If you win the clash, the spell moves from the stack to your hand as part of its
//     resolution. It never hits the graveyard. If you don't win the clash, the spell is put into
//     the graveyard from the stack as normal.
//   [2008-04-01] If the spell is countered or doesn't resolve for any reason (for example, if all
//     its targets become illegal), none of its effects happen. There is no clash, and the spell
//     card won't be returned to your hand.

export default defineCard({
  name: "Redeem the Lost",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature you control gains protection from the color of your choice until end of turn. Clash with an opponent. If you win, return Redeem the Lost to its owner's hand. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
      { kind: "clash", won: { kind: "return-to-hand", target: "source", from: "stack" } },
    ],
  },
});
