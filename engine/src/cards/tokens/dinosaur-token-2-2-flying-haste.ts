import { defineCard } from "../define.js";

/** 2/2 red and white Dinosaur with flying and haste — Dinosaurs on a
 * Spaceship's token. */
export default defineCard({
  name: "2/2 Red and White Dinosaur Token (Flying, Haste)",
  art: "3406b2d4-d227-4b03-801f-38230161c708",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: "Flying, haste",
});
