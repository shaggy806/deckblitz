import { defineCard } from "../define.js";

// The spell is on the stack as it counts, so it never counts itself (the
// ruling).
export default defineCard({
  name: "Goblin Gathering",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create a number of 1/1 red Goblin creature tokens equal to two plus the number of cards named Goblin Gathering in your graveyard.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Goblin Token",
    count: { sum: [2, { countInGraveyard: { name: "Goblin Gathering", ownedBy: "you" } }] },
  },
});
