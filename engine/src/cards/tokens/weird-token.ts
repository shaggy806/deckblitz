import { defineCard } from "../define.js";

// Thunderheads' 3/3 blue Weird with defender and flying. Its only printing
// is the front face of a Weird // Goblin double-faced token.

export default defineCard({
  name: "Weird Token",
  tokenName: "Weird",
  art: "1d34ff67-24e1-4cf5-b032-8be6b83e0819",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Weird"],
  power: 3,
  toughness: 3,
  keywords: ["defender", "flying"],
  text: "Defender\nFlying",
});
