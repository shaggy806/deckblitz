import { defineCard } from "../define.js";

// EDHREC rank 12623.
//
// Rulings:
//   [2022-02-18] You must pay all costs and follow all normal timing rules to play a card this
//     way.
//   [2022-02-18] A creature attacks alone if it's the only creature declared as an attacker during
//     the declare attackers step. For example, Tempered in Solitude's ability won't trigger if you
//     attack with multiple creatures and all but one of them are removed from combat.
//
// `attacks-alone` is exalted's event: exactly one attacker was declared.

const TEXT =
  "Whenever a creature you control attacks alone, exile the top card of your library. You may play that card this turn.";

export default defineCard({
  name: "Tempered in Solitude",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
