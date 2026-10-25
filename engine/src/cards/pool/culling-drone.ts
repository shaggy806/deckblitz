import { defineCard } from "../define.js";

// EDHREC rank 24207. Devoid: no colors.

export default defineCard({
  name: "Culling Drone",
  manaCost: "{1}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 2,
  text: "Devoid (This card has no color.)\nIngest (Whenever this creature deals combat damage to a player, that player exiles the top card of their library.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 1 },
      resolve: null,
      text: "Ingest",
    },
  ],
});
