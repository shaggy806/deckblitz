import { defineCard } from "../define.js";

// EDHREC rank 25142.

export default defineCard({
  name: "Imi Statue",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Players can't untap more than one artifact during their untap steps.",
  static: [
    {
      affects: { scope: "self" },
      untapLimit: { who: "each-player", count: 1, filter: { type: "artifact" } },
      text: "Players can't untap more than one artifact during their untap steps.",
    },
  ],
});
