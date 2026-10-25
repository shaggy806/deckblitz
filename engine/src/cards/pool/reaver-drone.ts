import { defineCard } from "../define.js";

// EDHREC rank 28531.
//
// Rulings:
//   [2016-01-22] Whether you control another colorless creature is checked as the ability
//     resolves. This check will happen even if Reaver Drone leaves the battlefield in response to
//     the ability.

const TEXT = "At the beginning of your upkeep, you lose 1 life unless you control another colorless creature.";

export default defineCard({
  name: "Reaver Drone",
  manaCost: "{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 1,
  text: `Devoid (This card has no color.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "not",
          of: { kind: "controls", filter: { type: "creature", colorless: true }, atLeast: 1, excludeSelf: true },
        },
        then: { kind: "lose-life", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
