import { defineCard } from "../define.js";

// EDHREC rank 28594.
//
// Rulings:
//   [2017-09-29] If you no longer control a Dinosaur after the first-strike combat damage step,
//     Imperial Lancer won't have double strike, and so it won't deal regular combat damage.

const TEXT = "This creature has double strike as long as you control a Dinosaur.";

export default defineCard({
  name: "Imperial Lancer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Dinosaur" }, atLeast: 1 },
      grantKeywords: ["double-strike"],
      text: TEXT,
    },
  ],
});
