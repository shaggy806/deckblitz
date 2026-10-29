import { defineCard } from "../define.js";

export default defineCard({
  name: "Commencement of Festivities",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt to players this turn.",
  targets: [],
  effect: { kind: "damage-rule", to: { players: "each" }, combat: true },
});
