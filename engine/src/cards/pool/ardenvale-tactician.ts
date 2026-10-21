import { defineCard } from "../define.js";

// EDHREC rank 16369. Throne of Eldraine.

export default defineCard({
  name: "Ardenvale Tactician",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying",
  faces: ["Ardenvale Tactician", "Dizzying Swoop"],
  adventure: true,
});
