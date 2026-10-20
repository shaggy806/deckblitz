import { defineCard } from "../define.js";

// Back face of Tales of Master Seshiro.

export default defineCard({
  name: "Seshiro's Living Legacy",
  art: "https://cards.scryfall.io/art_crop/back/5/1/512bc867-3a86-4da2-93f0-dd76d6a6f30d.jpg",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Snake", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance", "haste"],
  text: "Vigilance, haste",
  faces: ["Tales of Master Seshiro", "Seshiro's Living Legacy"],
  transform: true,
});
