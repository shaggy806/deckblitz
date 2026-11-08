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
      restrictions: [{ kind: "cant-be-blocked", byFewerThan: 3 }],
      text: "This creature can't be blocked except by three or more creatures.",
    },
  ],
});
