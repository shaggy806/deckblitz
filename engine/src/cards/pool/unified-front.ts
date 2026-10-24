import { defineCard } from "../define.js";

// EDHREC rank 21095. Converge: Kaleidoscorch's amount.

export default defineCard({
  name: "Unified Front",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Converge — Create a 1/1 white Kor Ally creature token for each color of mana spent to cast this spell.",
  targets: [],
  effect: { kind: "create-token", token: "Kor Ally Token", count: { colorsSpentOf: "source" } },
});
