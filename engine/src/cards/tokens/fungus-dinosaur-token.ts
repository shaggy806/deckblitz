import { defineCard } from "../define.js";

// The Skullspore Nexus's Fungus Dinosaur: an X/X, its base power and toughness
// set by the `create-token`'s `basePt` as it's made (printed 0/0 here).

export default defineCard({
  name: "Fungus Dinosaur Token",
  art: "f92f2858-e524-4d23-b947-d4dff20e7f59",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Dinosaur"],
  power: 0,
  toughness: 0,
  text: "",
});
