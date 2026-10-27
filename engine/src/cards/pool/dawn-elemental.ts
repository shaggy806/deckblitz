import { defineCard } from "../define.js";

// EDHREC rank 25413.

export default defineCard({
  name: "Dawn Elemental",
  manaCost: "{W}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nPrevent all damage that would be dealt to this creature.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self" },
      text: "Prevent all damage that would be dealt to this creature.",
    },
  ],
});
