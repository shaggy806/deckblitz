import { defineCard } from "../define.js";

export default defineCard({
  name: "Meditation Puzzle",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nYou gain 8 life.",
  effect: { kind: "gain-life", amount: 8 },
});
