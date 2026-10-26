import { defineCard } from "../define.js";

// EDHREC rank 27921. The untap ability is the enchanted creature's own, so
// only its controller can activate it (the ruling).

const GRANT_TEXT = "{1}, Put a -1/-1 counter on this creature: Untap this creature.";

export default defineCard({
  name: "Sinking Feeling",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature doesn't untap during its controller's untap step.\nEnchanted creature has \"{1}, Put a -1/-1 counter on this creature: Untap this creature.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false, addCounter: { kind: "-1/-1", count: 1 } },
          targets: [],
          effect: { kind: "untap", target: "source" },
          resolve: null,
          text: GRANT_TEXT,
        },
      ],
      text: `Enchanted creature has "${GRANT_TEXT}"`,
    },
  ],
});
