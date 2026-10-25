import { defineCard } from "../define.js";

const DIES_TEXT = "When this creature dies, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Salvage Drone",
  manaCost: "{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 1,
  toughness: 1,
  text: `Devoid (This card has no color.)\nIngest (Whenever this creature deals combat damage to a player, that player exiles the top card of their library.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 1 },
      resolve: null,
      text: "Ingest",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "drawn", who: "you" },
              then: { kind: "discard", target: "you", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
