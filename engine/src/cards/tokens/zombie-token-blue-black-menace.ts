import { defineCard } from "../define.js";

// A blue and black Zombie with menace, its size set as it's made (Corpse Cobble).
export default defineCard({
  name: "Zombie Token (Blue-Black, Menace)",
  art: "eb5fb489-6e46-4359-9c3c-ef1702526e5a",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 0,
  toughness: 0,
  keywords: ["menace"],
  text: "Menace",
});
