import { defineCard } from "../define.js";

export default defineCard({
  name: "Craft with Pride",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  effect: { kind: "create-token", token: "Treasure Token", count: 1 },
  prepareSpellOnly: true,
});
