import { defineCard } from "../define.js";

export default defineCard({
  name: "Vote Out",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nDestroy target creature.",
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
});
