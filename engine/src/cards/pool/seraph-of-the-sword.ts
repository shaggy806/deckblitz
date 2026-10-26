import { defineCard } from "../define.js";

export default defineCard({
  name: "Seraph of the Sword",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nPrevent all combat damage that would be dealt to this creature.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", combat: true, prevent: true, to: "self" },
      text: "Prevent all combat damage that would be dealt to this creature.",
    },
  ],
});
