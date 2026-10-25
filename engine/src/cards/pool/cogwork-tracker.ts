import { defineCard } from "../define.js";

// Conspiracy. EDHREC rank 31697.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so no player was
// noted for it. With no noted player, its last ability does nothing, though it must still
// attack each combat if able, and its controller chooses what it attacks (the rulings).
export default defineCard({
  name: "Cogwork Tracker",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dog", "Construct"],
  power: 4,
  toughness: 4,
  text: "Reveal this card as you draft it and note the player who passed it to you.\nThis creature attacks each combat if able.\nThis creature attacks a player you noted for cards named Cogwork Tracker each combat if able.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
