import { defineCard } from "../define.js";

// Stitcher Geralf's X/X blue Zombie token: it prints 0/0 and gets its size
// from `create-token`'s `basePt` as it's made.

export default defineCard({
  name: "Zombie Token (Stitcher Geralf)",
  art: "f7ee09ec-0d88-469d-b61c-976f3be47766",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 0,
  toughness: 0,
  text: "",
});
