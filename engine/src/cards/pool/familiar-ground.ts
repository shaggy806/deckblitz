import { defineCard } from "../define.js";

const TEXT = "Each creature you control can't be blocked by more than one creature.";

export default defineCard({
  name: "Familiar Ground",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [{ affects: { scope: "creatures-you-control" }, blockedByAtMostOne: true, text: TEXT }],
});
