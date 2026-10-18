import { defineCard } from "../define.js";

// EDHREC rank 11833.

export default defineCard({
  name: "Tyrranax Atrocity",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Dinosaur"],
  power: 4,
  toughness: 4,
  toxic: 3,
  keywords: ["haste"],
  text: "Haste\nToxic 3 (Players dealt combat damage by this creature also get three poison counters.)",
});
