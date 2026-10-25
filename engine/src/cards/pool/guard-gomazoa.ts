import { defineCard } from "../define.js";

// EDHREC rank 9954.

export default defineCard({
  name: "Guard Gomazoa",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish"],
  power: 1,
  toughness: 3,
  keywords: ["defender", "flying"],
  text: "Defender, flying\nPrevent all combat damage that would be dealt to this creature.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", combat: true, prevent: true, to: "self" },
      text: "Prevent all combat damage that would be dealt to this creature.",
    },
  ],
});
