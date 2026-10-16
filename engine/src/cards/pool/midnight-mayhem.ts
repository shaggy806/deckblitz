import { defineCard } from "../define.js";

// EDHREC rank 14720.
//
// Rulings:
//   [2024-09-20] Midnight Mayhem affects only Gremlins you control at the time it resolves,
//     including the Gremlin tokens it creates. Gremlins you begin to control later in the turn
//     won't gain menace, lifelink, or haste.
//
// The grants lock in the Gremlins there as they apply (rule 611.2c), the
// three new tokens among them.
export default defineCard({
  name: "Midnight Mayhem",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Create three 1/1 red Gremlin creature tokens. Gremlins you control gain menace, lifelink, and haste until end of turn. (A creature with menace can't be blocked except by two or more creatures.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Gremlin Token", count: 3 },
      { kind: "grant-keyword-all", filter: { subtype: "Gremlin", controlledBy: "you" }, keyword: "menace", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: { subtype: "Gremlin", controlledBy: "you" }, keyword: "lifelink", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: { subtype: "Gremlin", controlledBy: "you" }, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
