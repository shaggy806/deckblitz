import { defineCard } from "../define.js";

// Its ruling: the last ability is satisfied if any creature you control
// attacked this turn (raid's "you attacked"), not only the enchanted one.
const GRANTED = "Whenever this creature deals combat damage to a player, you may draw a card.";
const STATIC = `Enchanted creature gets +1/+1 and has "${GRANTED}"`;
const SACRIFICE =
  "At the beginning of your end step, if you didn't attack with a creature this turn, sacrifice this Aura.";

export default defineCard({
  name: "Curious Obsession",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC}\n${SACRIFICE}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STATIC,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "not", of: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SACRIFICE,
    },
  ],
});
