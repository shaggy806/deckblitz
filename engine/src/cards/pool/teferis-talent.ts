import { defineCard } from "../define.js";

// The granted −12 is a loyalty ability of the planeswalker's own (one
// loyalty activation a turn between them — the ruling).

const EMBLEM_TEXT =
  "You may activate loyalty abilities of planeswalkers you control on any player's turn any time you could cast an instant.";
const GRANT_TEXT = `Enchanted planeswalker has "[−12]: You get an emblem with '${EMBLEM_TEXT}'"`;
const DRAW_TEXT = "Whenever you draw a card, put a loyalty counter on enchanted planeswalker.";

export default defineCard({
  name: "Teferi's Talent",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant planeswalker\n${GRANT_TEXT}\n${DRAW_TEXT}`,
  targets: [{ kind: "permanent", filter: { type: "planeswalker" } }],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          loyaltyCost: -12,
          cost: { mana: null, tap: false },
          targets: [],
          effect: {
            kind: "create-emblem",
            text: EMBLEM_TEXT,
            static: { affects: { scope: "self" }, loyaltyAtInstantSpeed: true, text: EMBLEM_TEXT },
          },
          resolve: null,
          text: `[−12]: You get an emblem with "${EMBLEM_TEXT}"`,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "loyalty", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
