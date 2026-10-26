import { defineCard } from "../define.js";

// EDHREC rank 24115.
//
// Rulings:
//   [2012-05-01] The spell you target could also target other things, as long as it also targets a
//     player.
export default defineCard({
  name: "Outwit",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell that targets a player.",
  targets: [{ kind: "spell", filter: { targets: { player: "any" } } }],
  effect: { kind: "counter", target: 0 },
});
