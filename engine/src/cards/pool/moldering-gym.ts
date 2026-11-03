import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The left door of Moldering Gym // Weight Room (moldering-gym-weight-room.ts).
const UNLOCK =
  "When you unlock this door, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Moldering Gym",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Moldering Gym // Weight Room", "Moldering Gym", "Weight Room"],
  split: true,
});
