import { defineCard } from "../define.js";

// Rulings:
//   [2005-10-01] Instill Furor grants a triggered ability that triggers at the end of the
//     creature's controller's turn.
//   [2005-10-01] Once the ability triggers, nothing that happens to Instill Furor can prevent the
//     ability from resolving.
//
// "Unless it attacked this turn" is no intervening if: the ability always triggers, and whether
// the creature attacked is read as it resolves.

const GRANTED_TEXT = "At the beginning of your end step, sacrifice this creature unless it attacked this turn.";
const GRANT_TEXT = `Enchanted creature has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Instill Furor",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "end", who: "you" },
          targets: [],
          effect: {
            kind: "conditional",
            condition: { kind: "source", filter: { attackedThisTurn: false } },
            then: { kind: "sacrifice-source" },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
