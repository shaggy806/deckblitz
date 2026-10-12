import { defineCard } from "../define.js";

export default defineCard({
  name: "Great Teacher's Decree",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  rebound: true,
  text: "Creatures you control get +2/+1 until end of turn.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 2,
    toughness: 1,
    duration: "end-of-turn",
  },
});
