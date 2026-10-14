import { defineCard } from "../define.js";

// Jadar, Ghoulcaller of Nephalia's Zombie token.

export default defineCard({
  name: "Zombie Token (Jadar, Ghoulcaller of Nephalia)",
  art: "b0d6fd21-48f0-4151-9671-762c25d95592",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  keywords: ["decayed"],
  text: "Decayed (This creature can't block. When it attacks, sacrifice it at end of combat.)",
});
