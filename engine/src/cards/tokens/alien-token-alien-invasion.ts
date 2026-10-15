import { defineCard } from "../define.js";

// Alien Invasion's 1/1 red Alien with haste that attacks each combat if able.

export default defineCard({
  name: "Alien Token (Alien Invasion)",
  art: "eca87cbb-5958-4775-93ce-b1d4c7ef3a99",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Alien"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nThis token attacks each combat if able.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This token attacks each combat if able.",
    },
  ],
});
