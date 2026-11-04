import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

const UNLOCK =
  "When you unlock this door, search your library for a Room card that doesn't have the same name as a Room you control, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Central Elevator",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: [],
      // Only the names of unlocked doors (the ruling): `nameDiffersFromEach`
      // reads each permanent's names as they are.
      effect: {
        kind: "search-library",
        filter: { subtype: "Room", nameDiffersFromEach: { subtype: "Room", controlledBy: "you" } },
        destination: "hand",
        reveal: true,
        min: 0,
        max: 1,
      },
      resolve: null,
      text: UNLOCK,
    },
  ],
});
