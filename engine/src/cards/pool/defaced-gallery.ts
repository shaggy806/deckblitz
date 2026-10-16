import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Painter's Studio // Defaced Gallery (painters-studio-defaced-gallery.ts).
// The creatures attacking as it resolves get the bonus.
const ATTACK = "Whenever you attack, attacking creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Defaced Gallery",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${ATTACK}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true, controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
  faces: ["Painter's Studio // Defaced Gallery", "Painter's Studio", "Defaced Gallery"],
  split: true,
});
