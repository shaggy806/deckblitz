import { defineCard } from "../define.js";

// EDHREC rank 26147.

const FACES = ["Trial // Error", "Trial", "Error"];

export default defineCard({
  name: "Trial // Error",
  manaCost: "{W}{U}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["instant"],
  text: "Return all creatures blocking or blocked by target creature to their owner's hand.\n//\nCounter target multicolored spell.",
  faces: FACES,
  split: true,
});
