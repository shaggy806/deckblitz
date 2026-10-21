import { defineCard } from "../define.js";

// `restrict` with a filter is a rule for the rest of the turn, so a creature
// that comes under an opponent's control later can't block either (the
// ruling; rule 611.2c).
export default defineCard({
  name: "Cosmotronic Wave",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Cosmotronic Wave deals 1 damage to each creature your opponents control. Creatures your opponents control can't block this turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "opponent" } },
      { kind: "restrict", filter: { type: "creature", controlledBy: "opponent" }, restrictions: ["cant-block"] },
    ],
  },
});
