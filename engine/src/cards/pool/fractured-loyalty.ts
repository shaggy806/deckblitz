import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 23014.
// Retromancer's shape: the trigger's player slot is filled, untargeted, with
// the controller of the spell or ability that targeted the creature. The
// control change lasts indefinitely, past the Aura leaving.

const TEXT =
  "Whenever enchanted creature becomes the target of a spell or ability, that spell or ability's controller gains control of that creature.";

export default defineCard({
  name: "Fractured Loyalty",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT} (This effect lasts indefinitely.)`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "attached" },
      targets: ["player"],
      effect: { kind: "gain-control", target: "trigger-object", untilEndOfTurn: false, who: { target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
