import { defineCard } from "../define.js";

// Rulings:
//   If multiple "extra turn" effects resolve in the same turn, take them in the reverse of the
//     order that the effects resolved. (`extraTurns` is taken last-in first-out.)
export default defineCard({
  name: "Time Walk",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Take an extra turn after this one.",
  effect: { kind: "take-extra-turn" },
});
