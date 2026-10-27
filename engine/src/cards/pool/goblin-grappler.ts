import { defineCard } from "../define.js";
import { provoke } from "../helpers.js";

// EDHREC rank 20864.

export default defineCard({
  name: "Goblin Grappler",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: "Provoke (Whenever this creature attacks, you may have target creature defending player controls untap and block it if able.)",
  triggered: [provoke()],
});
