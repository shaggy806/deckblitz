import { defineCard } from "../define.js";

export default defineCard({
  name: "Feral Incarnation",
  manaCost: "{8}{G}",
  colors: ["G"],
  types: ["sorcery"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nCreate three 3/3 green Beast creature tokens.",
  effect: { kind: "create-token", token: "3/3 Beast Token", count: 3 },
});
