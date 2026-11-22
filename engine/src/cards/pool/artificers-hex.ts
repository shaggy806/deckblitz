import { defineCard } from "../define.js";

// EDHREC rank 20771.
// Rulings: the intervening "if" is checked as the upkeep begins and again on
// resolution (603.4); the creature destroyed is whatever the Equipment is
// attached to then, even a different one from when it triggered.

const TEXT = "At the beginning of your upkeep, if enchanted Equipment is attached to a creature, destroy that creature.";

export default defineCard({
  name: "Artificer's Hex",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Equipment\n${TEXT}`,
  targets: [{ kind: "permanent", filter: { subtype: "Equipment" } }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source", filter: { attachedTo: { attachedTo: { type: "creature" } } } },
      targets: [],
      effect: { kind: "destroy", target: { hostOf: "attached" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
