import { defineCard } from "../define.js";

export default defineCard({
  name: "Triplicate Spirits",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nCreate three 1/1 white Spirit creature tokens with flying.",
  effect: { kind: "create-token", token: "Spirit Token", count: 3 },
});
