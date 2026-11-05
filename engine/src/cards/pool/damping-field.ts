import { defineCard } from "../define.js";

// EDHREC rank 27398.

export default defineCard({
  name: "Damping Field",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Players can't untap more than one artifact during their untap steps.",
  static: [
    {
      affects: { scope: "self" },
      untapLimit: { who: "each-player", count: 1, filter: { type: "artifact" } },
      text: "Players can't untap more than one artifact during their untap steps.",
    },
  ],
});
