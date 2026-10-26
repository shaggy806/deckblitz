import { defineCard } from "../define.js";

// Back face of Loyal Cathar // Unhallowed Cathar.

export default defineCard({
  name: "Unhallowed Cathar",
  art: "https://cards.scryfall.io/art_crop/back/c/b/cb09041b-4d09-4cae-9e85-b859edae885b.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 2,
  toughness: 1,
  text: "This creature can't block.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  faces: ["Loyal Cathar", "Unhallowed Cathar"],
  transform: true,
});
