import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 20514.
//
// Rulings:
//   If all the cards in your library are lands, this card deals zero damage.
//   The targets are handled one at a time in turn order: first the active
//     player and the planeswalkers they control, in an order you choose, then
//     the next player's group, and so on.
//
// Each target's turn is Erratic Explosion's reveal: until a nonland card, the
// damage its mana value, then every card revealed on the bottom in an order
// of your choosing — before the next target's reveal begins. `turnOrder`
// groups the targets by player from the active player and asks the next of
// a group of two or more as it goes.

const TEXT =
  "Choose any number of target players or planeswalkers. For each of them, reveal cards from the top of your library until you reveal a nonland card, Kaboom! deals damage equal to that card's mana value to that player or planeswalker, then you put the revealed cards on the bottom of your library in any order.";

export default defineCard({
  name: "Kaboom!",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "any-number", of: "player-or-planeswalker" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    turnOrder: true,
    effect: {
      kind: "reveal-until",
      filter: { notTypes: ["land"] },
      then: { kind: "damage", target: 1, amount: { manaValueOf: 0 } },
      thenKeepsTargets: true,
      rest: "bottom-any-order",
    },
  },
});
