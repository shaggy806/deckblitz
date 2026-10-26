import { defineCard } from "../define.js";

// EDHREC rank 12520.
//
// Clash (rule 701.30) whether or not the spell was countered; the mill is
// its controller's, as the spell last existed (rule 608.2h).
//
// Rulings:
//   [2007-10-01] The clash (and the result of the clash if you win) happens regardless of whether
//     the targeted spell was countered or {X} was paid.
//   [2007-10-01] The opponent you clash with doesn't have to be the controller of the targeted
//     spell.

export default defineCard({
  name: "Broken Ambitions",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "unless", chooser: 0, options: [{ payGeneric: "x", text: "Pay {X}" }], otherwise: { kind: "counter", target: 0 } },
      { kind: "clash", won: { kind: "mill", target: 0, amount: 4 } },
    ],
  },
  text: "Counter target spell unless its controller pays {X}. Clash with an opponent. If you win, that spell's controller mills four cards. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
});
