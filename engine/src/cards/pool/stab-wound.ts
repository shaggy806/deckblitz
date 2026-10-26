import { defineCard } from "../define.js";

// EDHREC rank 9134. Soul Bleed's upkeep trigger.

const UPKEEP = "At the beginning of the upkeep of enchanted creature's controller, that player loses 2 life.";

export default defineCard({
  name: "Stab Wound",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets -2/-2.\n${UPKEEP}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-2, -2],
      text: "Enchanted creature gets -2/-2.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "active-player" },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
