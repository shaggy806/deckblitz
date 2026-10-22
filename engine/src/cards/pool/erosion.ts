import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of the upkeep of enchanted land's controller, destroy that land unless that player pays {1} or 1 life.";

export default defineCard({
  name: "Erosion",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [
          { pay: "{1}", text: "Pay {1}" },
          { payLife: 1, text: "Pay 1 life" },
        ],
        otherwise: { kind: "destroy", target: "attached" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
