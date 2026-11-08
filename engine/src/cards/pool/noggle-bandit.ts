import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 30004.

const TEXT = "This creature can't be blocked except by creatures with defender.";

export default defineCard({
  name: "Noggle Bandit",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Noggle", "Rogue"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, restrictions: [{ kind: "cant-be-blocked", by: { notKeyword: "defender" } }], text: TEXT }],
});
