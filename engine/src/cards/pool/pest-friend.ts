import { defineCard } from "../define.js";

// Lluwen, Exchange Student's prepare spell — never a deckable card of its own.
export default defineCard({
  name: "Pest Friend",
  manaCost: "{B/G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: 'Create a 1/1 black and green Pest creature token with "Whenever this token attacks, you gain 1 life."',
  effect: { kind: "create-token", token: "Pest Token (Attacks)", count: 1 },
});
