import { defineCard } from "../define.js";

// Crowded Crypt's Zombie token.

export default defineCard({
  name: "Zombie Token (Crowded Crypt)",
  art: "6adb8607-1066-451d-a719-74ad32358278",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  keywords: ["decayed"],
  text: "Decayed (This creature can't block. When it attacks, sacrifice it at end of combat.)",
});
