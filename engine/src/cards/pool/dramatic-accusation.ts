import { defineCard } from "../define.js";

// EDHREC rank 18804.

const ENTER_TEXT = "When this Aura enters, tap enchanted creature.";
const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";
const SHUFFLE_TEXT = "{U}{U}: Shuffle enchanted creature into its owner's library.";

export default defineCard({
  name: "Dramatic Accusation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${UNTAP_TEXT}\n${SHUFFLE_TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false },
      targets: [],
      effect: { kind: "shuffle-into-library", target: "attached" },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
