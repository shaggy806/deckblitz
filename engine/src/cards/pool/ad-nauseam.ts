import { defineCard } from "../define.js";

// EDHREC rank 1361.
// After each card, you choose whether to go on (the ruling), past 0 life if you like.

export default defineCard({
  name: "Ad Nauseam",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Reveal the top card of your library and put that card into your hand. You lose life equal to its mana value. You may repeat this process any number of times.",
  effect: {
    kind: "repeat",
    mayAgain: true,
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
  },
});
