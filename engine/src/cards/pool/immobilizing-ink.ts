import { defineCard } from "../define.js";

// EDHREC rank 26075.

const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";
const GRANTED_TEXT = "{1}, Discard a card: Untap this creature.";

export default defineCard({
  name: "Immobilizing Ink",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UNTAP_TEXT}\nEnchanted creature has "${GRANTED_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false, discard: { count: 1 } },
          targets: [],
          effect: { kind: "untap", target: "source" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Enchanted creature has "${GRANTED_TEXT}"`,
    },
  ],
});
