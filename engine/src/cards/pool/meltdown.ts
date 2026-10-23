import { defineCard } from "../define.js";

export default defineCard({
  name: "Meltdown",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy each artifact with mana value X or less.",
  effect: { kind: "destroy-all", filter: { type: "artifact", manaValue: { op: "lte", n: "x" } } },
});
