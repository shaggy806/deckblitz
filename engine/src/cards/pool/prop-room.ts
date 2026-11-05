import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Dazzling Theater // Prop Room (dazzling-theater-prop-room.ts).
const UNTAP = "Untap each creature you control during each other player's untap step.";

export default defineCard({
  name: "Prop Room",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${UNTAP}\n${ROOM_REMINDER}`,
  static: [
    {
      affects: { scope: "self" },
      untapsDuringOthersUntap: { type: "creature" },
      text: UNTAP,
    },
  ],
  faces: ["Dazzling Theater // Prop Room", "Dazzling Theater", "Prop Room"],
  split: true,
});
