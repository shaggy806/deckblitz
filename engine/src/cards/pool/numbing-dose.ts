import { defineCard } from "../define.js";

// EDHREC rank 28654. The upkeep trigger is Soul Bleed's shape.
//
// Rulings:
//   [2011-06-01] Numbing Dose may target and may enchant an untapped artifact or creature.
const UNTAP_TEXT = "Enchanted permanent doesn't untap during its controller's untap step.";
const UPKEEP_TEXT = "At the beginning of the upkeep of enchanted permanent's controller, that player loses 1 life.";

export default defineCard({
  name: "Numbing Dose",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${UNTAP_TEXT}\n${UPKEEP_TEXT}`,
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "active-player" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
