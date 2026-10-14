import { defineCard } from "../define.js";

// Ghoulish Procession's Zombie token.

export default defineCard({
  name: "Zombie Token (Ghoulish Procession)",
  art: "94a58666-209d-429d-a693-8ca2423a2ad0",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  keywords: ["decayed"],
  text: "Decayed (This creature can't block. When it attacks, sacrifice it at end of combat.)",
});
