import { defineCard } from "../define.js";

// EDHREC rank 15823. Battlebond. "Your team" is "you" outside a team game
// (rule 102.4).
//
// Rulings:
//   [2018-06-08] If your team didn't gain life during the turn before the end step begins, Regna's
//     last ability won't trigger at all. Gaining life during the end step won't cause the ability
//     to trigger.
//   [2018-06-08] Regna's last ability checks if any player on your team gained life at any point
//     during the turn. It doesn't matter if the player also lost life or whether the team's life
//     total is greater than it was at the beginning of the turn. It also doesn't matter whether
//     Regna was on the battlefield when the life gain happened.
//   [2018-06-08] Regna's last ability has you create two tokens, regardless of which player on
//     your team gained life, how many players on your team gained life, or how much life was
//     gained.
// The intervening-if is Ob Nixilis, the Ascended's.

export default defineCard({
  name: "Regna, the Redeemer",
  manaCost: "{5}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  pairing: { kind: "partner-with", name: "Krav, the Unredeemed" },
  text: "Partner with Krav, the Unredeemed (When this creature enters, target player may put Krav into their hand from their library, then shuffle.)\nFlying\nAt the beginning of each end step, if your team gained life this turn, create two 1/1 white Warrior creature tokens.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Krav, the Unredeemed?",
        effect: {
          kind: "search-library",
          filter: { name: "Krav, the Unredeemed" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Krav, the Unredeemed, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Warrior Token", count: 2 },
      resolve: null,
      text: "At the beginning of each end step, if your team gained life this turn, create two 1/1 white Warrior creature tokens.",
    },
  ],
});
