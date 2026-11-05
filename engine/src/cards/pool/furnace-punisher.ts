import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of each player's upkeep, this creature deals 2 damage to that player unless they control two or more basic lands.";

export default defineCard({
  name: "Furnace Punisher",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "not",
          of: {
            kind: "of-player",
            player: "active-player",
            condition: { kind: "controls", filter: { type: "land", supertype: "basic" }, atLeast: 2 },
          },
        },
        then: { kind: "damage", amount: 2, who: "active-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
