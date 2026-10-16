import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The left door of Ticket Booth // Tunnel of Hate (ticket-booth-tunnel-of-hate.ts).
const UNLOCK = "When you unlock this door, manifest dread.";

export default defineCard({
  name: "Ticket Booth",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: [],
      effect: { kind: "manifest-dread" },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Ticket Booth // Tunnel of Hate", "Ticket Booth", "Tunnel of Hate"],
  split: true,
});
