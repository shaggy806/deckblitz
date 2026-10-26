import { defineCard } from "../define.js";

// EDHREC rank 18263.
//
// Rulings:
//   [2012-10-01] If no opponent has lost life on the turn Cryptborn Horror enters, it will enter
//     with no +1/+1 counters on it and be put into its owner's graveyard (unless something else is
//     raising its toughness).
//   [2012-10-01] Remember, damage dealt to a player causes that player to lose that much life
//     (unless the source has infect).
//   [2012-10-01] In multiplayer games, life lost the turn Cryptborn Horror enters by opponents who
//     left the game later that turn will count toward the value of X.
//   [2012-10-01] Cryptborn Horror cares about the total life lost, not necessarily what an
//     opponent's life total is compared to what it was at the beginning of the turn. For example,
//     if an opponent loses 5 life and then gains 10 life on the turn Cryptborn Horror enters, it
//     will enter with five +1/+1 counters on it.
//
// `turnStat: "life-lost"` is the running total of life lost this turn (gains don't offset it),
// and counts an opponent who has since left the game (`playersCountedInScope`).

export default defineCard({
  name: "Cryptborn Horror",
  manaCost: "{1}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: "Trample\nThis creature enters with X +1/+1 counters on it, where X is the total life lost by your opponents this turn.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { turnStat: "life-lost", who: "each-opponent" } },
      },
      text: "This creature enters with X +1/+1 counters on it, where X is the total life lost by your opponents this turn.",
    },
  ],
});
