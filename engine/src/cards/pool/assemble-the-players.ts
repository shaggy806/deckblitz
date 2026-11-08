import { defineCard } from "../define.js";

const TEXT = "Once each turn, you may cast a creature spell with power 2 or less from the top of your library.";

export default defineCard({
  name: "Assemble the Players",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  looksAtOwnLibraryTop: true,
  text: `You may look at the top card of your library any time.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "library-top", filter: { type: "creature", power: { op: "lte", n: 2 } }, oncePerTurn: true },
      text: TEXT,
    },
  ],
});
