import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

const UNLOCK =
  "When you unlock this door, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";

export default defineCard({
  name: "Underwater Tunnel",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Underwater Tunnel // Slimy Aquarium", "Underwater Tunnel", "Slimy Aquarium"],
  split: true,
});
