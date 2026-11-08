import { defineCard } from "../define.js";

// Rulings:
//   Gaining control of a permanent doesn't cause you to gain control of any
//     Auras or Equipment attached to it.
//   A token's owner is the player who created it.
// The creature deals the damage, so its lifelink is its controller's. "Your
// upkeep" is the Aura's controller's. With the trigger on the stack: the creature
// gone first, the Aura last existed attached to nothing and nothing's dealt; both
// gone at once, the creature deals it as it last existed (rule 608.2h).

const TRIGGER_TEXT = "At the beginning of your upkeep, enchanted creature deals 1 damage to its owner.";

export default defineCard({
  name: "Enslave",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nYou control enchanted creature.\n${TRIGGER_TEXT}`,
  targets: ["creature"],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      resolve: null,
      effect: { kind: "damage", amount: 1, who: { ownerOf: "attached" }, from: "attached" },
      text: TRIGGER_TEXT,
    },
  ],
});
