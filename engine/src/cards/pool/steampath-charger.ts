import { defineCard } from "../define.js";
import { offspringTrigger } from "../helpers.js";

// Bloomburrow (BLB). EDHREC rank 12678. Offspring (rule 702.175) as Agate Instigator
// has it: the 1/1 copy has the dies trigger too.
const DIES_TEXT = "When this creature dies, it deals 1 damage to target player.";

export default defineCard({
  name: "Steampath Charger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warlock"],
  power: 2,
  toughness: 1,
  text: `Offspring {2} (You may pay an additional {2} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\n${DIES_TEXT}`,
  triggered: [
    offspringTrigger(),
    {
      trigger: { on: "dies", who: "self" },
      targets: ["player"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  kicker: { cost: "{2}", keyword: "offspring" },
});
