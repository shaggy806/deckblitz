import { defineCard } from "../define.js";

// EDHREC rank 8245.

export default defineCard({
  name: "Ichorspit Basilisk",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Basilisk"],
  power: 1,
  toughness: 3,
  toxic: 1,
  keywords: ["deathtouch"],
  text: "Deathtouch\nToxic 1 (Players dealt combat damage by this creature also get a poison counter.)",
});
