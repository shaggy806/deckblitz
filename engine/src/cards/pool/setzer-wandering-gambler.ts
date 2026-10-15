import { defineCard } from "../define.js";

// EDHREC rank 12054.
//
// Rulings:
//   [2025-06-13] Some effects that instruct a player to flip a coin care only about whether the coin
//     comes up heads or tails. These effects don't normally cause any player to win or lose that coin
//     flip.
//
// - The Blackjack is its own named legendary token (`tokens/the-blackjack.ts`).
// - "Flip a coin." is a `flip-coin` with no branches: Setzer's controller flips
//   and calls it (rule 705.2 — his last ability cares who wins), and a win is a
//   `coin-flipped` event his `wins-coin-flip` trigger fires on, as Tavern
//   Scoundrel's does.
const ENTER_TEXT =
  "When Setzer enters, create The Blackjack, a legendary 3/3 colorless Vehicle artifact token with flying and crew 2.";
const FLIP_TEXT = "Whenever a Vehicle you control deals combat damage to a player, flip a coin.";
const WIN_TEXT = "Whenever you win a coin flip, create two tapped Treasure tokens.";

export default defineCard({
  name: "Setzer, Wandering Gambler",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Pilot"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${FLIP_TEXT}\n${WIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "The Blackjack", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { subtype: "Vehicle" } },
      targets: [],
      effect: { kind: "flip-coin" },
      resolve: null,
      text: FLIP_TEXT,
    },
    {
      trigger: { on: "wins-coin-flip", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 2, tapped: true },
      resolve: null,
      text: WIN_TEXT,
    },
  ],
});
