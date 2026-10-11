import { defineCard } from "../define.js";

// A 3/3 red Ape Villain with haste — Red Ghost, Intangible Genius's token.
export default defineCard({
  name: "Ape Villain Token",
  art: "b0212004-3d0b-4dcd-b166-e5f80cb150a1",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ape", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste",
});
