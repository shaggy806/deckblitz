import { defineCard } from "../define.js";

// Rulings:
//   The triggered ability can target a creature with indestructible. It won't be destroyed.
//   Even though the player whose upkeep it is chooses the target creature, you control the ability.
//     An opponent can't target a creature with hexproof they control.
const TEXT =
  "At the beginning of each player's upkeep, destroy target nonartifact creature that player controls of their choice. It can't be regenerated.";

export default defineCard({
  name: "Magus of the Abyss",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targetsChosenBy: "active-player",
      targets: [
        { kind: "permanent", filter: { type: "creature", notTypes: ["artifact"], controlledBy: "active-player" } },
      ],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
