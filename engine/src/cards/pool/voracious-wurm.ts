import { defineCard } from "../define.js";

// EDHREC rank 21673.
//
// Rulings:
//   [2013-07-01] In a Two-Headed Giant game, life gained by your teammate isn’t considered, even
//     though it causes your team’s life total to increase.
//   [2013-07-01] Voracious Wurm’s ability checks how much life you’ve gained during the turn, not
//     what your life total is compared to what it was when the turn began. For example, if you
//     start the turn at 10 life, gain 6 life during the turn, then lose 6 life later that turn,
//     Voracious Wurm will enter the battlefield with six +1/+1 counters.

const TEXT =
  "This creature enters with X +1/+1 counters on it, where X is the amount of life you've gained this turn.";

export default defineCard({
  name: "Voracious Wurm",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { turnStat: "life-gained", who: "you" } },
      },
      text: TEXT,
    },
  ],
});
