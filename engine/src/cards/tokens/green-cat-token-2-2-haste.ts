import { defineCard } from "../define.js";

// A 2/2 green Cat with haste — Jinnie Fay, Jetmir's Second's Cat. It pins no
// art.
export default defineCard({
  name: "2/2 Green Cat Token (Haste)",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
});
