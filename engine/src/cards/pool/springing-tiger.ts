import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 31132.

const TEXT = "Threshold — This creature gets +2/+2 as long as there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Springing Tiger",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, condition: { kind: "threshold" }, grantPt: [2, 2], text: TEXT }],
});
