import { defineCard } from "../define.js";

// Rulings:
//   The controller of The Abyss controls the ability, but the current player chooses what gets
//     destroyed.

const TEXT =
  "At the beginning of each player's upkeep, destroy target nonartifact creature that player controls of their choice. It can't be regenerated.";

export default defineCard({
  name: "The Abyss",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targetsChosenBy: "active-player",
      targets: [{ kind: "permanent", filter: { type: "creature", notTypes: ["artifact"], controlledBy: "active-player" } }],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
