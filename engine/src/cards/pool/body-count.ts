import { defineCard } from "../define.js";

// EDHREC rank 8036.
//
// Rulings:
//   [2024-01-12] Damage dealt to a player causes that player to lose that much life.
//   [2024-01-12] A card's spectacle cost is the same no matter how much life your opponents lost
//     or how many opponents lost life.
//   [2024-01-12] Spectacle doesn't change when you can cast the spell. For example, you can't cast
//     a sorcery with spectacle during an opponent's turn unless another effect allows you to do
//     so, even if that player has lost life this turn.
//   [2024-01-12] Spectacle cares only that an opponent lost life during the turn, not that the
//     opponent's life total is currently lower than it was. For example, if an opponent loses 1
//     life and then gains 2 life in the same turn, you can cast a spell for its spectacle cost
//     that turn.
//   [2024-01-12] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as a spectacle cost), add any cost increases, then apply any cost
//     reductions. The mana value of the spell remains unchanged, no matter what the total cost to
//     cast it was.
//   [2024-01-12] In a multiplayer game, if an opponent loses life and later that turn leaves the
//     game, you can cast a spell for its spectacle cost. (If a player leaves the game during their
//     turn, that turn continues without an active player.)

export default defineCard({
  name: "Body Count",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  alternativeCost: {
    mana: "{B}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: "Spectacle {B} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)\nDraw a card for each creature that died under your control this turn.",
  targets: [],
  effect: { kind: "draw", amount: { creaturesDiedThisTurn: true } },
});
