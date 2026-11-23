import { defineCard } from "../define.js";

// Playtest card. Every Sliver you control — this one too, a Dragon Sliver —
// has flying, Niv-Mizzet's draw trigger (dealt by that Sliver) and a tap-draw.

const DRAW_TRIGGER = "Whenever you draw a card, this creature deals 1 damage to any target.";
const TAP_DRAW = "{T}: Draw a card.";
const TEXT = `Slivers you control have flying and "${DRAW_TRIGGER}" and "${TAP_DRAW}"`;

export default defineCard({
  name: "Sliv-Mizzet, Hivemind",
  manaCost: "{2}{U}{U}{R}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Sliver"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver", controlledBy: "you" } },
      grantKeywords: ["flying"],
      grantsTriggered: [
        {
          trigger: { on: "draws", who: "you" },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: DRAW_TRIGGER,
        },
      ],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: TAP_DRAW,
        },
      ],
      text: TEXT,
    },
  ],
});
