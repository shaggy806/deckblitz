import { defineCard } from "../define.js";

const GRANTED_TEXT = "Whenever you gain life, put that many +1/+1 counters on this creature.";
const STATIC_TEXT = `Enchanted creature has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Sunbond",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "gains-life", who: "you" },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
