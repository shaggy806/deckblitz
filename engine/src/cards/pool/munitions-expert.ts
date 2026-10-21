import { defineCard } from "../define.js";

// EDHREC rank 10445.
//
// Rulings:
//   [2019-06-14] The number of Goblins you control is counted only as Munitions Expert's ability
//     resolves. If Munitions Expert is still on the battlefield, it will count itself.

const TEXT =
  "When this creature enters, you may have it deal damage to target creature or planeswalker equal to the number of Goblins you control.";

export default defineCard({
  name: "Munitions Expert",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "may",
        prompt: "Have Munitions Expert deal damage to the target equal to the number of Goblins you control?",
        effect: {
          kind: "damage",
          amount: { countOf: { subtype: "Goblin", controlledBy: "you" } },
          target: 0,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
