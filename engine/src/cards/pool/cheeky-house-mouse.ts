import { defineCard } from "../define.js";

// EDHREC rank 10589. The creature half of an adventurer card (rule 715);
// Squeak By is its Adventure.

export default defineCard({
  name: "Cheeky House-Mouse",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Mouse"],
  power: 2,
  toughness: 1,
  text: "",
  faces: ["Cheeky House-Mouse", "Squeak By"],
  adventure: true,
});
