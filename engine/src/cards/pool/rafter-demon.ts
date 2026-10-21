import { defineCard } from "../define.js";

// EDHREC rank 26020.

export default defineCard({
  name: "Rafter Demon",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 2,
  alternativeCost: {
    mana: "{3}{B}{R}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: "Spectacle {3}{B}{R} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)\nWhen this creature enters, if its spectacle cost was paid, each opponent discards a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
      resolve: null,
      text: "When this creature enters, if its spectacle cost was paid, each opponent discards a card.",
      condition: { kind: "self-spectacle-paid" },
    },
  ],
});
