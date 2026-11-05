import { defineCard } from "../define.js";

// Chapter II's look is a `discard-chosen` of nothing, which is what `look-at-hand`
// does for a target slot; "that player" here is the one the event names. The card
// from outside the game goes on top unrevealed (the ruling).
const ONE = "I — Create a 1/1 blue Bird creature token with flying. You gain 2 life.";
const TWO_TRIGGER =
  "Whenever one or more creatures you control with flying deal combat damage to a player this turn, look at that player's hand and draw a card.";
const TWO = `II — ${TWO_TRIGGER}`;
const THREE = "III — You may put a card you own from outside the game on top of your library.";

export default defineCard({
  name: "The Raven's Warning",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${ONE}\n${TWO}\n${THREE}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "1/1 Blue Bird Token", count: 1 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ONE,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: {
            on: "deals-damage-batch",
            who: "you-control",
            filter: { type: "creature", keyword: "flying" },
            combat: true,
          },
        },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard-chosen", target: "trigger-player", lookOnly: true, optional: true, upTo: 0 },
            { kind: "draw", amount: 1 },
          ],
        },
        text: TWO_TRIGGER,
      },
      resolve: null,
      text: TWO,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "search-library", filter: {}, destination: "library-top", min: 0, max: 1, outside: "only" },
      resolve: null,
      text: THREE,
    },
  ],
});
