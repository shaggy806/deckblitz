import { defineCard } from "../define.js";

// EDHREC rank 1235.
//
// Rulings:
//   [2019-01-25] Casting an exiled card causes it to leave exile. You can't cast it multiple
//     times.
//   [2019-01-25] Light Up the Stage doesn't change when you can play the exiled cards. For
//     example, if you exile a sorcery card, you can cast it only during your main phase when the
//     stack is empty. If you exile a land card, you can play it only during your main phase and
//     only if you have an available land play remaining.
//   [2019-01-25] If you don't play a card exiled this way, it remains in exile.
//   [2024-01-12] In a multiplayer game, if an opponent loses life and later that turn leaves the
//     game, you can cast a spell for its spectacle cost. (If a player leaves the game during their
//     turn, that turn continues without an active player.)
//   [2024-01-12] Damage dealt to a player causes that player to lose that much life.
//   [2024-01-12] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as a spectacle cost), add any cost increases, then apply any cost
//     reductions. The mana value of the spell remains unchanged, no matter what the total cost to
//     cast it was.
//   [2024-01-12] Spectacle cares only that an opponent lost life during the turn, not that the
//     opponent's life total is currently lower than it was. For example, if an opponent loses 1
//     life and then gains 2 life in the same turn, you can cast a spell for its spectacle cost
//     that turn.
//   [2024-01-12] A card's spectacle cost is the same no matter how much life your opponents lost
//     or how many opponents lost life.
//   [2024-01-12] Spectacle doesn't change when you can cast the spell. For example, you can't cast
//     a sorcery with spectacle during an opponent's turn unless another effect allows you to do
//     so, even if that player has lost life this turn.

export default defineCard({
  name: "Light Up the Stage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  alternativeCost: {
    mana: "{R}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: "Spectacle {R} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)\nExile the top two cards of your library. Until the end of your next turn, you may play those cards.",
  targets: [],
  effect: { kind: "impulse-exile", amount: 2, duration: "your-next-turn" },
});
