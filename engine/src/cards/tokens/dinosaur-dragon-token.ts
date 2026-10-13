import { defineCard } from "../define.js";

/** 4/4 red Dinosaur Dragon with flying — Draconautics Engineer's token. */
export default defineCard({
  name: "Dinosaur Dragon Token",
  art: "932aac56-2afa-4431-96fa-bd55d8bba983",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying",
});
