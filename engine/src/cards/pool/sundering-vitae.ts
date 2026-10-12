import { defineCard } from "../define.js";

export default defineCard({
  name: "Sundering Vitae",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nDestroy target artifact or enchantment.",
  targets: ["artifact-or-enchantment"],
  effect: { kind: "destroy", target: 0 },
});
