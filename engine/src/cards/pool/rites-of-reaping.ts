import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 30565.
//
// "Another target creature": two slots of one group, so the second can't be the first
// (`distinctTargets`, rule 601.2c).

export default defineCard({
  name: "Rites of Reaping",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Target creature gets +3/+3 until end of turn. Another target creature gets -3/-3 until end of turn.",
  targets: distinctTargets(2, "creature"),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: -3, toughness: -3, duration: "end-of-turn" },
    ],
  },
});
