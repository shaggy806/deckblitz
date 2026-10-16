import { defineCard } from "../define.js";

// EDHREC rank 10036.
//
// Rulings:
//   [2024-07-26] Fireglass Mentor’s ability cares whether an opponent lost life this turn, not how
//     their life total changed. For example, an opponent who gained 2 life and lost 1 life in the
//     same turn still lost life.
//   [2024-07-26] You pay all costs and follow all timing rules for cards played this way. For
//     example, if the exiled card is a land card, you may play it only during your main phase
//     while the stack is empty.
//
// "Your second main phase" is a `postcombat-main` trigger gated on
// `turn-structure` `mainPhase: 2` (Michelangelo, the Heart's shape); the
// intervening if is the `life-lost` turn stat, asked as it triggers and again
// on resolution. "Choose one of them. Until end of turn, you may play that
// card" is Tectonic Giant's `impulse-exile` with `choose: 1`.

const TEXT =
  "At the beginning of your second main phase, if an opponent lost life this turn, exile the top two cards of your library. Choose one of them. Until end of turn, you may play that card.";

export default defineCard({
  name: "Fireglass Mentor",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warlock"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
        ],
      },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "end-of-turn", choose: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
