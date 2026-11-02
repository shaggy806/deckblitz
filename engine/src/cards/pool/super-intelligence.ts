import { defineCard } from "../define.js";

const TRIGGER = "At the beginning of the upkeep of enchanted creature's controller, that player draws a card.";

export default defineCard({
  name: "Super Intelligence",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TRIGGER}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached" },
      targets: [],
      effect: { kind: "draw", amount: 1, who: "active-player" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
