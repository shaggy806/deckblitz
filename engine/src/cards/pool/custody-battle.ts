import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, target opponent gains control of this creature unless you sacrifice a land.";

export default defineCard({
  name: "Custody Battle",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has "${UPKEEP_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: ["opponent"],
          effect: {
            kind: "unless",
            chooser: "you",
            options: [{ sacrifice: { type: "land" }, text: "Sacrifice a land" }],
            otherwise: { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
          },
          resolve: null,
          text: UPKEEP_TEXT,
        },
      ],
      text: `Enchanted creature has "${UPKEEP_TEXT}"`,
    },
  ],
});
