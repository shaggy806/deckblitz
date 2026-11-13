import { defineCard } from "../define.js";

// Each player's top card is exiled; the permission is Triple Triad's
// controller's alone, over their own card and each other one with a lesser
// mana value than it (`grantIf`, judged once all are exiled). With no card of
// their own exiled (an empty library), "it" is nothing and no other card has
// a lesser mana value; their own land (mana value 0) leaves none either.
const TEXT =
  "At the beginning of your upkeep, each player exiles the top card of their library. Until end of turn, you may " +
  "play the card you own exiled this way and each other card exiled this way with lesser mana value than it " +
  "without paying their mana costs.";

export default defineCard({
  name: "Triple Triad",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "each-player",
        duration: "end-of-turn",
        play: true,
        free: true,
        grantIf: {
          anyOf: [
            { ownedBy: "you" },
            {
              manaValue: {
                op: "lt",
                n: {
                  amount: { aggregate: "sum", of: "mana-value", filter: { ownedBy: "you" }, in: { thisWay: "exiled" } },
                },
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
