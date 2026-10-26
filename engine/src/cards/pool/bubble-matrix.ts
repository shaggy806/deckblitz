import { defineCard } from "../define.js";

const TEXT = "Prevent all damage that would be dealt to creatures.";

export default defineCard({
  name: "Bubble Matrix",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, toFilter: { type: "creature" } },
      text: TEXT,
    },
  ],
});
