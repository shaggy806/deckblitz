import { defineCard } from "../define.js";
import { provoke } from "../helpers.js";

// EDHREC rank 31129.

export default defineCard({
  name: "Lowland Tracker",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\nProvoke (Whenever this creature attacks, you may have target creature defending player controls untap and block it if able.)",
  triggered: [provoke()],
});
