import { defineCard } from "../define.js";

const TEXT = "You may look at the top card of your library and at face-down creatures you don't control any time.";

export default defineCard({
  name: "Lens of Clarity",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      visibility: { looksAtOwnLibraryTop: true, looksAtFaceDownCreatures: true },
      text: TEXT,
    },
  ],
});
