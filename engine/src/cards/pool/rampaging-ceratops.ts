import { defineCard } from "../define.js";

// EDHREC rank 12440.

export default defineCard({
  name: "Rampaging Ceratops",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 4,
  text: "This creature can't be blocked except by three or more creatures.",
  static: [
    {
      affects: { scope: "self" },
      blockedByAtLeast: 3,
      text: "This creature can't be blocked except by three or more creatures.",
    },
  ],
});
