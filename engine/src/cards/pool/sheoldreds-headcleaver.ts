import { defineCard } from "../define.js";

// EDHREC rank 14678.

export default defineCard({
  name: "Sheoldred's Headcleaver",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Warrior"],
  power: 2,
  toughness: 4,
  toxic: 2,
  keywords: ["menace"],
  text: "Menace\nToxic 2 (Players dealt combat damage by this creature also get two poison counters.)",
});
