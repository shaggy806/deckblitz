import { defineCard } from "../define.js";
import { provoke } from "../helpers.js";

// EDHREC rank 28682.

export default defineCard({
  name: "Brontotherium",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nProvoke (Whenever this creature attacks, you may have target creature defending player controls untap and block it if able.)",
  triggered: [provoke()],
});
