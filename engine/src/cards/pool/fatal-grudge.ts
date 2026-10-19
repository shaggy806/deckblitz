import { defineCard } from "../define.js";

export default defineCard({
  name: "Fatal Grudge",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text:
    "As an additional cost to cast this spell, sacrifice a nonland permanent.\n" +
    "Each opponent chooses a permanent they control that shares a card type with the sacrificed permanent and sacrifices it.\n" +
    "Draw a card.",
  // Paid even when cast without paying its mana cost (the ruling).
  additionalCost: { sacrifice: { notTypes: ["land"], controlledBy: "you" } },
  effect: {
    kind: "sequence",
    effects: [
      // The sacrificed permanent's card types as it last existed on the
      // battlefield; a copy reads the original's (the ruling).
      { kind: "sacrifice", who: "each-opponent", filter: { sharesCardTypeWith: "sacrificed" }, count: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
