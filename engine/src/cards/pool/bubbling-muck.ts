import { defineCard } from "../define.js";

// High Tide, for Swamps: a delayed triggered mana ability (rule 605.1b).
export default defineCard({
  name: "Bubbling Muck",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Until end of turn, whenever a player taps a Swamp for mana, that player adds an additional {B}.",
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "tapped-for-mana", who: "any", filter: { subtype: "Swamp" } } },
    effect: { kind: "add-mana", mana: "B", amount: 1 },
    text: "Whenever a player taps a Swamp for mana, that player adds an additional {B}.",
  },
});
