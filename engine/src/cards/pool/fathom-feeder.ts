import { defineCard } from "../define.js";

// EDHREC rank 16794. Devoid: colourless (`colors: []`).
//
// Ingest exiles face up, and from an empty library does nothing (the
// rulings) — Ulamog, the Ceaseless Hunger's `exile-from-library`.
const ACTIVATED_TEXT = "{3}{U}{B}: Draw a card. Each opponent exiles the top card of their library.";

export default defineCard({
  name: "Fathom Feeder",
  manaCost: "{U}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Devoid (This card has no color.)\nDeathtouch\nIngest (Whenever this creature deals combat damage to a player, that player exiles the top card of their library.)\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 1 },
      resolve: null,
      text: "Ingest",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "exile-from-library", whose: "each-opponent", amount: 1 },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
