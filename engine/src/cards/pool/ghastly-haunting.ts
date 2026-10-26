import { defineCard } from "../define.js";

// Soul Seizer's back face. Mind Control's static: its controller controls
// the enchanted creature for as long as it stays attached.

export default defineCard({
  name: "Ghastly Haunting",
  art: "https://cards.scryfall.io/art_crop/back/f/5/f500cb95-d5ea-4cf2-920a-f1df45a9059b.jpg",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nYou control enchanted creature.",
  targets: ["creature"],
  faces: ["Soul Seizer", "Ghastly Haunting"],
  transform: true,
  controlEnchanted: true,
});
