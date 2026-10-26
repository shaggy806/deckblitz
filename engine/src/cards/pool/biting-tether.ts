import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 26572.
//
// Mind Control's control (`controlEnchanted`) plus Glistening Oil's upkeep
// counter on the enchanted creature.

const UPKEEP_TEXT = "At the beginning of your upkeep, put a -1/-1 counter on enchanted creature.";

export default defineCard({
  name: "Biting Tether",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nYou control enchanted creature.\n${UPKEEP_TEXT}`,
  targets: ["creature"],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
