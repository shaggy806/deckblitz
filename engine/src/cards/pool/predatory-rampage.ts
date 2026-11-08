import { defineCard } from "../define.js";

// A rule for the turn over the blockers (rule 611.2c): one entering later blocks too.
export default defineCard({
  name: "Predatory Rampage",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Creatures you control get +3/+3 until end of turn. Each creature your opponents control blocks this turn if able.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "restrict", filter: { type: "creature", controlledBy: "opponent" }, restrictions: ["must-block"] },
    ],
  },
});
