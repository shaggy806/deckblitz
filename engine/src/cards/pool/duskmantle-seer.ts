import { defineCard } from "../define.js";

export default defineCard({
  name: "Duskmantle Seer",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, each player reveals the top card of their library, loses life equal to that card's mana value, then puts it into their hand.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "library",
          count: 1,
          reveal: true,
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "stay",
          // A look-and-choose's `then` runs as the player who chose (here
          // each player in turn, about their own revealed card), so "you" is
          // that player — the set-gtc test pins it for both seats.
          then: { kind: "lose-life", who: "you", amount: { manaValueOf: 0 } },
        },
      },
      resolve: null,
      text: "At the beginning of your upkeep, each player reveals the top card of their library, loses life equal to that card's mana value, then puts it into their hand.",
    },
  ],
});
