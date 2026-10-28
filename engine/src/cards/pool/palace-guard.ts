import { defineCard } from "../define.js";

// EDHREC rank 18288.
//
// `blockAdditional: "any"`.

export default defineCard({
  name: "Palace Guard",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 4,
  text: "This creature can block any number of creatures.",
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: "any",
      text: "This creature can block any number of creatures.",
    },
  ],
});
