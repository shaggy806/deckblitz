import { defineCard } from "../define.js";

// EDHREC rank 9282.
//
// Rulings:
//   [2023-10-13] If you cast Impending Flux from exile, it counts itself when determining the
//     value of X.
//   [2023-10-13] Casting a foretold card from exile follows the timing rules for that card. If you
//     foretell an instant card, you can cast it as soon as the next player's turn. In most cases,
//     if you foretell a card that isn't an instant (like Impending Flux), you'll have to wait
//     until your next turn to cast it.
//   [2023-10-13] Paradox abilities count any spells cast from zones other than your hand. These
//     are usually spells cast from exile, the graveyard, or the command zone. They also count
//     spells cast from outside the game, such as spells cast with Wish or Garth One-Eye's ability.
//   [2023-10-13] If a spell or ability allows you to copy a spell on the stack but doesn't specify
//     that the spell is cast, that spell wasn't cast and won't be counted by paradox abilities.
//
// X counts this turn's cast records (`castThisTurn`, each read as it was
// cast — copies were never cast) from every zone a spell can be cast from but
// the hand (Alex Wilder, Runaway's `anyOf`), so a foretold Flux counts itself.
// One instruction over each opponent and their creatures (Tectonic Hazard).
const NOT_FROM_HAND = {
  anyOf: [{ castFrom: "graveyard" }, { castFrom: "exile" }, { castFrom: "library" }, { castFrom: "command" }],
} as const;
const X = { sum: [1, { castThisTurn: NOT_FROM_HAND }] } as const;

export default defineCard({
  name: "Impending Flux",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  foretell: { cost: "{1}{R}{R}" },
  text: "Paradox — Impending Flux deals X damage to each opponent and each creature they control, where X is 1 plus the number of spells you've cast from anywhere other than your hand this turn.\nForetell {1}{R}{R} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: X, who: "each-opponent" },
      { kind: "damage-all", filter: { type: "creature" }, whose: "each-opponent", amount: X },
    ],
  },
});
