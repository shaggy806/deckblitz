import { defineCard } from "../define.js";

const GRANTED_TEXT = "{B}, {T}: Put a -1/-1 counter on target creature.";

export default defineCard({
  name: "Sadistic Obsession",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has "${GRANTED_TEXT}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{B}", tap: true },
          targets: ["creature"],
          effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Enchanted creature has "${GRANTED_TEXT}"`,
    },
  ],
});
