import { defineCard } from "../define.js";

export default defineCard({
  name: "Maestros Charm",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Look at the top five cards of your library. Put one of those cards into your hand and the rest into your graveyard.\n" +
    "• Each opponent loses 3 life and you gain 3 life.\n" +
    "• Maestros Charm deals 5 damage to target creature or planeswalker.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Look at the top five cards of your library. Put one of those cards into your hand and the rest into your graveyard.",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 5,
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "graveyard",
        },
      },
      {
        text: "Each opponent loses 3 life and you gain 3 life.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 3, who: "each-opponent" },
            { kind: "gain-life", amount: 3 },
          ],
        },
      },
      {
        text: "Maestros Charm deals 5 damage to target creature or planeswalker.",
        targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "damage", amount: 5, target: 0 },
      },
    ],
  },
});
