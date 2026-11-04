import { defineCard } from "../define.js";

// A delayed triggered mana ability (rules 603.7, 605.1b): it never uses the
// stack, the extra {U} comes with the Island's own, and the mana goes to whoever
// tapped the Island. Each High Tide resolved is an ability of its own.
export default defineCard({
  name: "High Tide",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, whenever a player taps an Island for mana, that player adds an additional {U}.",
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "tapped-for-mana", who: "any", filter: { subtype: "Island" } } },
    effect: { kind: "add-mana", mana: "U", amount: 1 },
    text: "Whenever a player taps an Island for mana, that player adds an additional {U}.",
  },
});
