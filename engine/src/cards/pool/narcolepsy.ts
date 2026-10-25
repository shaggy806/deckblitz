import { defineCard } from "../define.js";

const TEXT = "At the beginning of each upkeep, if enchanted creature is untapped, tap it.";

// An intervening-if (rule 603.4, the ruling): it triggers only if the
// creature is untapped as the upkeep begins and does nothing if it was tapped
// in response.
export default defineCard({
  name: "Narcolepsy",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: { kind: "source", filter: { attachedTo: { tapped: false } } },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: TEXT,
    },
  ],
});
