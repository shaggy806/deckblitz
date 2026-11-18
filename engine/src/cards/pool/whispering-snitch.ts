import { defineCard } from "../define.js";

// EDHREC rank 17641.
//
// Rulings:
//   [2018-10-05] If you surveil before Whispering Snitch enters the battlefield, surveilling again
//     during that turn won't cause its ability to trigger.
//   [2018-10-05] In a Two-Headed Giant game, Whispering Snitch's ability causes the opposing team
//     to lose 2 life and you gain 1 life.
//   [2024-01-12] An ability that triggers "whenever you surveil" triggers after you're done
//     surveilling, even if you have fewer cards in your library than the number of cards you're
//     instructed to surveil. It even triggers if you have no cards in your library.
//
// "For the first time each turn" counts your surveils this turn from the
// journal (`scried` entries of `how: "surveil"`), those before it entered
// included; a scry isn't one.

const SURVEIL_TEXT =
  "Whenever you surveil for the first time each turn, this creature deals 1 damage to each opponent and you gain 1 life.";

export default defineCard({
  name: "Whispering Snitch",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 1,
  toughness: 3,
  text: SURVEIL_TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "surveils", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
