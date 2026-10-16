import { defineCard } from "../define.js";
import { ROOM_REMINDER, unlockThisDoor } from "../helpers.js";

// The left door of Painter's Studio // Defaced Gallery (painters-studio-defaced-gallery.ts).
// The exiled cards are played by the normal rules: costs paid, a land only
// as a land play (the ruling).
const UNLOCK =
  "When you unlock this door, exile the top two cards of your library. You may play them until the end of your next turn.";

export default defineCard({
  name: "Painter's Studio",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNLOCK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: unlockThisDoor("left"),
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "your-next-turn" },
      resolve: null,
      text: UNLOCK,
    },
  ],
  faces: ["Painter's Studio // Defaced Gallery", "Painter's Studio", "Defaced Gallery"],
  split: true,
});
