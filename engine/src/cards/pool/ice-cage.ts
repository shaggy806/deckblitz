import { defineCard } from "../define.js";

// EDHREC rank 24443.
//
// The destroy trigger goes on the stack above the spell or ability that
// targeted the creature, so it resolves first (its ruling).

const DESTROY_TEXT = "When enchanted creature becomes the target of a spell or ability, destroy this Aura.";

export default defineCard({
  name: "Ice Cage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature can't attack or block, and its activated abilities can't be activated.\n${DESTROY_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "attached", targeterNotTarget: true },
      targets: [],
      effect: { kind: "destroy", target: "source" },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});
