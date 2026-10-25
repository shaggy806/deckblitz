import { defineCard } from "../define.js";

// EDHREC rank 20700.
//
// Ingest: the player dealt damage exiles their top card, face up; an empty
// library exiles nothing (the ruling).
const INGEST = "Whenever this creature deals combat damage to a player, that player exiles the top card of their library.";

export default defineCard({
  name: "Mist Intruder",
  manaCost: "{1}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Devoid (This card has no color.)\nFlying\nIngest (${INGEST})`,
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
