import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Charred Foyer // Warped Space (charred-foyer-warped-space.ts).
const FREE = "Once each turn, you may pay {0} rather than pay the mana cost for a spell you cast from exile.";

export default defineCard({
  name: "Warped Space",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${FREE}\n${ROOM_REMINDER}`,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: { mana: "{0}", oncePerTurn: true, when: { castFrom: "exile" } },
      text: FREE,
    },
  ],
  faces: ["Charred Foyer // Warped Space", "Charred Foyer", "Warped Space"],
  split: true,
});
