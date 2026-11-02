import { defineCard } from "../define.js";

// Rule 724.1: the effect exiles the stack, this spell included, and the game
// skips to the cleanup step.
export default defineCard({
  name: "Time Stop",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `End the turn. (Exile all spells and abilities, including this spell. The player whose turn it is discards down to their maximum hand size. Damage heals and "this turn" and "until end of turn" effects end.)`,
  effect: { kind: "end-the-turn" },
});
