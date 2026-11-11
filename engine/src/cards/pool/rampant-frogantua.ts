import { defineCard } from "../define.js";
import type { StaticAbility } from "../define.js";

// EDHREC rank 5428.
//
// Rulings:
//   [2024-11-08] Rampant Frogantua's second ability counts players who lost the game before
//     Rampant Frogantua entered the battlefield.
//   [2024-11-08] If the number of cards remaining in your library is less than the amount of
//     combat damage dealt to a player by Rampant Frogantua, you can't choose to mill that many
//     cards with Rampant Frogantua's last ability.
//
// "+10/+10 for each player who has lost the game": one +10/+10 for each
// number of lost players reached. A game seats at most four, so at most
// three can have lost while it goes on.
const PUMP_TEXT = "This creature gets +10/+10 for each player who has lost the game.";
const MILL_TEXT =
  "Whenever this creature deals combat damage to a player, you may mill that many cards. Put any number of land cards from among them onto the battlefield tapped.";

const perLost = (atLeast: number): StaticAbility => ({
  affects: { scope: "self" },
  condition: { kind: "players-lost", atLeast },
  grantPt: [10, 10],
  text: PUMP_TEXT,
});

export default defineCard({
  name: "Rampant Frogantua",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${PUMP_TEXT}\n${MILL_TEXT}`,
  static: [perLost(1), perLost(2), perLost(3)],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Mill that many cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "mill", target: "you", amount: { triggerValue: true } },
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 0,
              max: { triggerValue: true },
              filter: { type: "land", thisWay: "milled" },
              destination: "battlefield",
              enterTapped: true,
              leftover: "stay",
            },
          ],
        },
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
