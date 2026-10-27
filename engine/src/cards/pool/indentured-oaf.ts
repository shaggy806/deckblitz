import { defineCard } from "../define.js";

const TEXT = "Prevent all damage that this creature would deal to red creatures.";

export default defineCard({
  name: "Indentured Oaf",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 4,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        fromSelf: true,
        toFilter: { type: "creature", colors: ["R"] },
      },
      text: TEXT,
    },
  ],
});
