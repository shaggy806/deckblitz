import { defineCard } from "../define.js";

const GRANT = 'Enchanted creature has "Whenever this creature attacks, you may tap or untap target permanent."';

export default defineCard({
  name: "Ghostly Touch",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: ["permanent"],
          effect: {
            kind: "modal",
            minModes: 0,
            maxModes: 1,
            modes: [
              { text: "Tap target permanent.", effect: { kind: "tap", target: 0 } },
              { text: "Untap target permanent.", effect: { kind: "untap", target: 0 } },
            ],
          },
          resolve: null,
          text: "Whenever this creature attacks, you may tap or untap target permanent.",
        },
      ],
      text: GRANT,
    },
  ],
});
