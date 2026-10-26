import { defineCard } from "../define.js";

// EDHREC rank 13518.

export default defineCard({
  name: "Kuldotha Rebirth",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice an artifact.\nCreate three 1/1 red Goblin creature tokens.",
  targets: [],
  additionalCost: { sacrifice: { type: "artifact", controlledBy: "you" } },
  effect: { kind: "create-token", token: "Goblin Token", count: 3 },
});
