import { defineCard } from "../define.js";

export default defineCard({
  name: "Great Sable Stag",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk"],
  power: 3,
  toughness: 3,
  cantBeCountered: true,
  text: "This spell can't be countered.\nProtection from blue and from black (This creature can't be blocked, targeted, dealt damage, or enchanted by anything blue or black.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["U", "B"] },
      text: "Protection from blue and from black",
    },
  ],
});
