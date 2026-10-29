import { defineCard } from "../define.js";

// EDHREC rank 20432.

const UPKEEP_TEXT = "At the beginning of the upkeep of enchanted creature's controller, that player loses 1 life.";

export default defineCard({
  name: "One Thousand Lashes",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature can't attack or block, and its activated abilities can't be activated.\n${UPKEEP_TEXT}`,
  targets: ["creature"],
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
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});
