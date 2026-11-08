import { defineCard } from "../define.js";

// The target and its namesakes go in one `return-from-graveyard` (rule 201.2a):
// "all other cards", creature cards or not.

export default defineCard({
  name: "Echoing Return",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card and all other cards with the same name as that card from your graveyard to your hand.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-from-graveyard", filter: { sameNameWith: 0 }, destination: "hand", count: "all" },
});
