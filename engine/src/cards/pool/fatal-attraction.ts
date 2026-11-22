import { defineCard } from "../define.js";

const ENTERS = "When this Aura enters, it deals 2 damage to enchanted creature.";
const UPKEEP = "At the beginning of your upkeep, this Aura deals 4 damage to enchanted creature.";

// Both are dealt to what the Aura enchants as each trigger resolves — not a
// target, so hexproof and shroud don't stop them.
export default defineCard({
  name: "Fatal Attraction",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS}\n${UPKEEP}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 2, target: "attached" },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 4, target: "attached" },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
