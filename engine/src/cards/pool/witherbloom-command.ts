import { defineCard } from "../define.js";

// EDHREC rank 8550. "You return a land card" isn't optional: one is returned
// when the graveyard has one — any land card there, one just milled or one
// already there (the ruling), whoever's library was milled.

export default defineCard({
  name: "Witherbloom Command",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text:
    "Choose two —\n" +
    "• Target player mills three cards, then you return a land card from your graveyard to your hand.\n" +
    "• Destroy target noncreature, nonland permanent with mana value 2 or less.\n" +
    "• Target creature gets -3/-1 until end of turn.\n" +
    "• Target opponent loses 2 life and you gain 2 life.",
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Target player mills three cards, then you return a land card from your graveyard to your hand.",
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "mill", target: 0, amount: 3 },
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 1,
              max: 1,
              destination: "hand",
              leftover: "stay",
              filter: { type: "land" },
            },
          ],
        },
      },
      {
        text: "Destroy target noncreature, nonland permanent with mana value 2 or less.",
        targets: [
          { kind: "permanent", whose: "any", filter: { notTypes: ["creature", "land"], manaValue: { op: "lte", n: 2 } } },
        ],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Target creature gets -3/-1 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -3, toughness: -1, duration: "end-of-turn" },
      },
      {
        text: "Target opponent loses 2 life and you gain 2 life.",
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 2, target: 0 },
            { kind: "gain-life", amount: 2 },
          ],
        },
      },
    ],
  },
});
