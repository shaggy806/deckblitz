import { defineCard } from "../define.js";

// "Attacked this combat" is the declaration that fired it (`eachOf`, read as
// they were declared): one creature that's both a Pirate and a Vehicle will do.

export default defineCard({
  name: "Fearless Swashbuckler",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Fish", "Pirate"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\nVehicles you control have haste.\nWhenever you attack, if a Pirate and a Vehicle attacked this combat, draw three cards, then discard two cards.",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Vehicle", controlledBy: "you" } },
      grantKeywords: ["haste"],
      text: "Vehicles you control have haste.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", eachOf: [{ subtype: "Pirate" }, { subtype: "Vehicle" }] },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: "Whenever you attack, if a Pirate and a Vehicle attacked this combat, draw three cards, then discard two cards.",
    },
  ],
});
