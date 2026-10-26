import { defineCard } from "../define.js";

// Baru, Fist of Krosa's X/X green Wurm creature token: it prints 0/0 and gets
// its size from `create-token`'s `basePt` as it's made.

export default defineCard({
  name: "Wurm Token (Baru, Fist of Krosa)",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 0,
  toughness: 0,
});
