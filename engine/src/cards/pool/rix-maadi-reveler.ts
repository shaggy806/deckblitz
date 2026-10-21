import { defineCard } from "../define.js";

export default defineCard({
  name: "Rix Maadi Reveler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  alternativeCost: {
    mana: "{2}{B}{R}",
    keyword: "spectacle",
    condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
  },
  text: "Spectacle {2}{B}{R} (You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn.)\nWhen this creature enters, discard a card, then draw a card. If this creature's spectacle cost was paid, instead discard your hand, then draw three cards.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-spectacle-paid" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "discard-hand", who: "you" },
            { kind: "draw", amount: 3 },
          ],
        },
        else: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "draw", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, discard a card, then draw a card. If this creature's spectacle cost was paid, instead discard your hand, then draw three cards.",
    },
  ],
});
