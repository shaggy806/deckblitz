import { defineCard } from "../define.js";

// A red X/1 Elemental with trample and haste (Purphoros's Intervention): the
// printed 0/1 is overridden by the creating effect's `basePt`.

export default defineCard({
  name: "X/1 Elemental Token (Trample, Haste)",
  art: "60466c78-155e-442b-8022-795e1e9de8df",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 1,
  keywords: ["trample", "haste"],
  text: "Trample, haste",
});
