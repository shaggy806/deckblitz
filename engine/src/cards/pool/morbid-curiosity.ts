import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 8371.
//
// The sacrificed permanent's mana value is read as it last existed (ruling),
// {X} counting 0.
export default defineCard({
  name: "Morbid Curiosity",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice an artifact or creature.\nDraw cards equal to the mana value of the sacrificed permanent.",
  additionalCost: { sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
  targets: [],
  effect: { kind: "draw", amount: { manaValueOf: "sacrificed" } },
});
