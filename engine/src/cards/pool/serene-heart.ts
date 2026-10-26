import { defineCard } from "../define.js";

export default defineCard({
  name: "Serene Heart",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy all Auras.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "enchantment", subtype: "Aura" } },
});
