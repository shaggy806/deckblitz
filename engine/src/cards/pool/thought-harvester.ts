import { defineCard } from "../define.js";

// EDHREC rank 22514.
//
// Rulings:
//   [2016-01-22] The triggered ability will resolve before the colorless spell that caused it to
//     trigger.
//   [2016-01-22] The card is exiled face up.

const TEXT = "Whenever you cast a colorless spell, target opponent exiles the top card of their library.";

export default defineCard({
  name: "Thought Harvester",
  manaCost: "{3}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Devoid (This card has no color.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colorless: true } },
      targets: ["opponent"],
      effect: { kind: "exile-from-library", whose: 0, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
