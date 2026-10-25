import { defineCard } from "../define.js";

// EDHREC rank 17642. Inspired (the becomes-untapped trigger) with Dark
// Confidant's reveal: the card goes to hand, then its mana value is lost.
const INSPIRED_TEXT =
  "Inspired — Whenever this creature becomes untapped, reveal the top card of your library and put that card into your hand. You lose life equal to that card's mana value.";

export default defineCard({
  name: "Pain Seer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: INSPIRED_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
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
      text: INSPIRED_TEXT,
    },
  ],
});
