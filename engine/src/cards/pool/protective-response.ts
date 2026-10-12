import { defineCard } from "../define.js";

export default defineCard({
  name: "Protective Response",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nDestroy target attacking or blocking creature.",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "destroy", target: 0 },
});
