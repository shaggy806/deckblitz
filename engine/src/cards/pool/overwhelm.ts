import { defineCard } from "../define.js";

export default defineCard({
  name: "Overwhelm",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nCreatures you control get +3/+3 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 3,
    toughness: 3,
    duration: "end-of-turn",
  },
});
