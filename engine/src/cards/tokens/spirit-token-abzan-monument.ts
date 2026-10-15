import { defineCard } from "../define.js";

// Abzan Monument's X/X white Spirit creature token: it prints 0/0 and gets
// its size from `create-token`'s `basePt` as it's made.

export default defineCard({
  name: "Spirit Token (Abzan Monument)",
  art: "8ea4fc2f-95a4-49d0-b06e-b88d19637737",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  text: "",
});
