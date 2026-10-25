import { defineCard } from "../define.js";

// EDHREC rank 18940.
// Makes Clue → use "Clue Token".
// Turning it face up sets up a delayed triggered ability for the rest of the
// turn (rule 603.7c): each creature you control that deals combat damage to
// a player investigates once.
const FACE_UP_TEXT =
  "When this creature is turned face up, until end of turn, whenever a creature you control deals combat damage to a player, investigate.";

export default defineCard({
  name: "Mistway Spy",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Detective"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\nDisguise {1}{U} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{1}{U}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
        },
        effect: { kind: "create-token", token: "Clue Token", count: 1 },
        text: "Whenever a creature you control deals combat damage to a player, investigate.",
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
