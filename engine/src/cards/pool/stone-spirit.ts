import { defineCard } from "../define.js";

// EDHREC rank 32141. Reach isn't flying, so a creature with reach can block
// it (the ruling).
export default defineCard({
  name: "Stone Spirit",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Spirit"],
  power: 4,
  toughness: 3,
  text: "This creature can't be blocked by creatures with flying.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { keyword: "flying" },
      text: "This creature can't be blocked by creatures with flying.",
    },
  ],
});
