import { defineCard } from "../define.js";

const GRANTED_TEXT = "{T}, Discard a card: Gain control of target creature until end of turn.";
const TEXT = `Enchanted land has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Chamber of Manipulation",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true, discard: { count: 1 } },
          targets: ["creature"],
          effect: { kind: "gain-control", target: 0, untilEndOfTurn: true },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
