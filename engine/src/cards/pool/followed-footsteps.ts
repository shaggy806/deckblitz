import { defineCard } from "../define.js";

// "Enchanted creature" is read as the trigger resolves: moved in response, it's
// the new host; the Aura gone, the creature it was last on, as it last existed;
// the host gone first, nothing (the rulings). The token is the Aura's
// controller's, whoever controls the creature (rule 111.2).
const TEXT = "At the beginning of your upkeep, create a token that's a copy of enchanted creature.";

export default defineCard({
  name: "Followed Footsteps",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "create-token-copy", of: "enchanted", count: 1, who: "you" },
      resolve: null,
      text: TEXT,
    },
  ],
});
