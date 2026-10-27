import { defineCard } from "../define.js";

// EDHREC rank 30716. Uncle Istvan's shape.

const TEXT = "Prevent all damage that would be dealt to this creature by creatures.";

export default defineCard({
  name: "Champion Lancer",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self", source: { types: ["creature"] } },
      text: TEXT,
    },
  ],
});
