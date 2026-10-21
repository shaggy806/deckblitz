import { defineCard } from "../define.js";

const TEXT = "This creature can't be blocked by enchanted creatures or enchantment creatures.";

export default defineCard({
  name: "Temple Thief",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { anyOf: [{ enchanted: true }, { type: "enchantment" }] },
      text: TEXT,
    },
  ],
});
