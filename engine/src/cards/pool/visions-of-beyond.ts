import { defineCard } from "../define.js";

// "A graveyard" is any one player's, yours included, read as it resolves.

export default defineCard({
  name: "Visions of Beyond",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw a card. If a graveyard has twenty or more cards in it, draw three cards instead.",
  effect: {
    kind: "conditional",
    condition: { kind: "cards-in-graveyard", whose: "any-player", atLeast: 20 },
    then: { kind: "draw", amount: 3 },
    else: { kind: "draw", amount: 1 },
  },
});
