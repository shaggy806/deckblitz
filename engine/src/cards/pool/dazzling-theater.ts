import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The left door of Dazzling Theater // Prop Room (dazzling-theater-prop-room.ts).
const CONVOKE =
  "Creature spells you cast have convoke. (Your creatures can help cast those spells. Each creature you tap while casting a creature spell pays for {1} or one mana of that creature's color.)";

export default defineCard({
  name: "Dazzling Theater",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${CONVOKE}\n${ROOM_REMINDER}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "creature" }, convoke: true },
      text: CONVOKE,
    },
  ],
  faces: ["Dazzling Theater // Prop Room", "Dazzling Theater", "Prop Room"],
  split: true,
});
