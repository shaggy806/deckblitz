import { defineCard } from "../define.js";
import { forageOptions } from "../helpers.js";

// Rulings:
//   [2024-07-26] You can't sacrifice a Food to pay multiple costs.

const COMBAT_TEXT = "At the beginning of combat on your turn, you may forage.";
const FORAGE_TEXT = "Whenever you forage, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Corpseberry Cultivator",
  manaCost: "{1}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Squirrel", "Warlock"],
  power: 2,
  toughness: 3,
  text: `${COMBAT_TEXT} (Exile three cards from your graveyard or sacrifice a Food.)\n${FORAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "each-player-may", who: "you", options: forageOptions() },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      // Any forage of yours, not only this creature's own.
      trigger: { on: "forages", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: FORAGE_TEXT,
    },
  ],
});
