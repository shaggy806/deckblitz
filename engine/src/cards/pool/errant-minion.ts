import { defineCard } from "../define.js";

// Power Leak's shape on a creature: the upkeep of whoever controls the
// enchanted creature as that upkeep begins (`whileCondition`), that player may
// pay any amount of mana, then 2 damage to them with X of it prevented (a
// prevention effect, rule 615.6 — `damage`'s `prevent`).

const TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, that player may pay any amount of mana. This Aura deals 2 damage to that player. Prevent X of that damage, where X is the amount of mana that player paid this way.";

export default defineCard({
  name: "Errant Minion",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "players-pay-any-amount",
        resource: "mana",
        who: "active-player",
        then: { kind: "damage", amount: 2, who: "that-player", prevent: "x" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
