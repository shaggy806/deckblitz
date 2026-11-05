import { defineCard } from "../define.js";

// EDHREC rank 30060.

export default defineCard({
  name: "Magma Hellion",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 5,
  toughness: 4,
  keywords: ["trample", "haste"],
  assist: true,
  text: "Assist (Another player can pay up to {6} of this spell's cost.)\nTrample, haste",
});
