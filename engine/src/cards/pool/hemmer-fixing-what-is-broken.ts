import { defineCard } from "../define.js";

// EDHREC rank 28474.

const HEXPROOF_TEXT =
  "During your turn, Spacecraft you control have hexproof. (They can't be the targets of spells or abilities your opponents control.)";
const LOOT_TEXT = "Whenever Hemmer becomes tapped, draw a card, then discard a card.";

export default defineCard({
  name: "Hemmer, Fixing What Is Broken",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Aenar", "Artificer"],
  power: 2,
  toughness: 3,
  text: `${HEXPROOF_TEXT}\n${LOOT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Spacecraft", controlledBy: "you" } },
      condition: { kind: "your-turn" },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
