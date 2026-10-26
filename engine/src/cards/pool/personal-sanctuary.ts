import { defineCard } from "../define.js";

// EDHREC rank 23032.

const TEXT = "During your turn, prevent all damage that would be dealt to you.";

export default defineCard({
  name: "Personal Sanctuary",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      replacement: { event: "would-deal-damage", prevent: true, to: "you" },
      text: TEXT,
    },
  ],
});
