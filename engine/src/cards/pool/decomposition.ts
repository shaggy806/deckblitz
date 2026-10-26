import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Mirage (MIR). EDHREC rank 30809.
//
// The cumulative upkeep is the creature's own (granted), so it triggers on
// its controller's upkeep, the age counters go on the creature and its
// controller pays or sacrifices it. "Enchant black creature" is the target
// filter, which the state-based check reads too (704.5m). "Its controller"
// on the death is the creature's as it died.

const DIES_TEXT = "When enchanted creature dies, its controller loses 2 life.";

export default defineCard({
  name: "Decomposition",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant black creature\nEnchanted creature has "Cumulative upkeep—Pay 1 life." (At the beginning of its controller's upkeep, that player puts an age counter on it, then sacrifices it unless they pay its upkeep cost for each age counter on it.)\n${DIES_TEXT}`,
  targets: [{ kind: "permanent", filter: { type: "creature", colors: ["B"] } }],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [cumulativeUpkeep({ life: 1 })],
      text: 'Enchanted creature has "Cumulative upkeep—Pay 1 life."',
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
