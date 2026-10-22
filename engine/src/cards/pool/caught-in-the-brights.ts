import { defineCard } from "../define.js";

// EDHREC rank 23134. "Enchanted creature" is read as the trigger resolves —
// the creature it was last attached to if this Aura has left in response (the
// ruling; the `"attached"` ref falls back to its last-known host).

const STATIC = "Enchanted creature can't attack or block.";
const TRIGGER = "When a Vehicle you control attacks, exile enchanted creature.";

export default defineCard({
  name: "Caught in the Brights",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC}\n${TRIGGER}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: STATIC,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Vehicle" } },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
