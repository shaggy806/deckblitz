import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The right door of Cramped Vents // Access Maze (cramped-vents-access-maze.ts).
const MAZE =
  "Once during each of your turns, you may cast a spell from your hand by paying life equal to its mana value rather than paying its mana cost.";

export default defineCard({
  name: "Access Maze",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${MAZE}\n${ROOM_REMINDER}`,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        payLifeManaValue: true,
        oncePerTurn: true,
        when: { castFrom: "hand", yourTurnOnly: true },
      },
      text: MAZE,
    },
  ],
  faces: ["Cramped Vents // Access Maze", "Cramped Vents", "Access Maze"],
  split: true,
});
