import { defineCard } from "../define.js";

// EDHREC rank 7736. Rivals of Ixalan.
//
// Call to Mind's return, then "Exile Flood of Recollection" as the last part
// of its own resolution (`exileOnResolve`).

export default defineCard({
  name: "Flood of Recollection",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return target instant or sorcery card from your graveyard to your hand. Exile Flood of Recollection.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  exileOnResolve: true,
});
