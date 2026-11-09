import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The left door of Charred Foyer // Warped Space (charred-foyer-warped-space.ts).
const UPKEEP = "At the beginning of your upkeep, exile the top card of your library. You may play it this turn.";

export default defineCard({
  name: "Charred Foyer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UPKEEP}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true },
      resolve: null,
      text: UPKEEP,
    },
  ],
  faces: ["Charred Foyer // Warped Space", "Charred Foyer", "Warped Space"],
  split: true,
});
