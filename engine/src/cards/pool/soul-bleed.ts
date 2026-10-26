import { defineCard } from "../define.js";

const TEXT = "At the beginning of the upkeep of enchanted creature's controller, that player loses 1 life.";

export default defineCard({
  name: "Soul Bleed",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
