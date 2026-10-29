import { defineCard } from "../define.js";

export default defineCard({
  name: "Chameleon Blur",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all damage that creatures would deal to players this turn.",
  targets: [],
  effect: { kind: "damage-rule", to: { players: "each" }, by: { filter: { type: "creature" } } },
});
