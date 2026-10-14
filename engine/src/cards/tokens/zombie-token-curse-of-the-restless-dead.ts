import { defineCard } from "../define.js";

// Curse of the Restless Dead's Zombie token.

export default defineCard({
  name: "Zombie Token (Curse of the Restless Dead)",
  art: "6adb8607-1066-451d-a719-74ad32358278",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  keywords: ["decayed"],
  text: "Decayed (This creature can't block. When it attacks, sacrifice it at end of combat.)",
});
