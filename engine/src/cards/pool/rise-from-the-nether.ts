import { defineCard } from "../define.js";

// Marvel: Darkhold Destiny (preview). Counted as it resolves, when the spell
// itself is on the stack and not among the cards in the graveyard.
export default defineCard({
  name: "Rise from the Nether",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Create a 3/1 black Mindless-One creature token for each noncreature, nonland card in your graveyard.",
  effect: {
    kind: "create-token",
    token: "Mindless-One Token",
    count: { countInGraveyard: { notTypes: ["creature", "land"], ownedBy: "you" } },
  },
});
