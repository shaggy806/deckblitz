import { defineCard } from "../define.js";

// EDHREC rank 10468.
//
// Rulings:
//   [2023-02-04] Creatures your opponents control can't block the same turn Hazardous Blast
//     resolves whether or not they were actually dealt damage by it. This includes creatures that
//     entered the battlefield and permanents that became creatures after it resolved.

// The blocking clause is `restrict` over a filter: a rule for the rest of the
// turn (rule 611.2c), binding a creature that enters or becomes one later.
export default defineCard({
  name: "Hazardous Blast",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Hazardous Blast deals 1 damage to each creature your opponents control. Creatures your opponents control can't block this turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "opponent" } },
      { kind: "restrict", filter: { type: "creature", controlledBy: "opponent" }, restrictions: ["cant-block"] },
    ],
  },
});
