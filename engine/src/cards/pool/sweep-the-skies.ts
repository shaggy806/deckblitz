import { defineCard } from "../define.js";

// X only buys room to spend more colours (the ruling): the count is the
// colours spent, never X. A copy, or a free cast, spent none.
export default defineCard({
  name: "Sweep the Skies",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Converge — Create a 1/1 colorless Thopter artifact creature token with flying for each color of mana spent to cast this spell.",
  targets: [],
  effect: { kind: "create-token", token: "Thopter Token", count: { colorsSpentOf: "source" } },
});
