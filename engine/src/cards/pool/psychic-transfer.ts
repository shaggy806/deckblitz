import { defineCard } from "../define.js";

// Rulings:
//   If one of the players has a negative life total, you use their actual life total for
//   determining the difference. If that difference is five or less, then the other player
//   receives the negative life total.
//   If an effect says that a player can't lose life, that player can't exchange life totals with
//   a player who has a lower life total; in that case, the exchange won't happen.

export default defineCard({
  name: "Psychic Transfer",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "If the difference between your life total and target player's life total is 5 or less, exchange life totals with that player.",
  targets: ["player"],
  effect: {
    kind: "conditional",
    condition: { kind: "player-compare", stat: "life", compare: "within", by: 5, than: { target: 0 } },
    then: { kind: "exchange-life-totals", second: { target: 0 } },
  },
});
