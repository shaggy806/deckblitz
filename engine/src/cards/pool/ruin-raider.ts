import { defineCard } from "../define.js";

// EDHREC rank 18132. Ixalan. Raid's intervening-if over Dark Confidant's
// reveal: the card goes to hand and you lose life equal to its mana value.

export default defineCard({
  name: "Ruin Raider",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 3,
  toughness: 2,
  text: "Raid — At the beginning of your end step, if you attacked this turn, reveal the top card of your library and put that card into your hand. You lose life equal to the card's mana value.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        reveal: true,
        then: { kind: "lose-life", who: "you", amount: { manaValueOf: 0 } },
      },
      resolve: null,
      text: "Raid — At the beginning of your end step, if you attacked this turn, reveal the top card of your library and put that card into your hand. You lose life equal to the card's mana value.",
    },
  ],
});
