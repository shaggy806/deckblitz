import { defineCard } from "../define.js";

const END_TEXT =
  "At the beginning of the end step of enchanted creature's controller, this Aura deals 2 damage to that player unless that creature attacked this turn.";

export default defineCard({
  name: "Insubordination",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${END_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "source", filter: { attachedTo: { attackedThisTurn: true } } } },
        then: { kind: "damage", amount: 2, who: "active-player" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
