import { defineCard } from "../define.js";

// EDHREC rank 18873. The restriction isn't a characteristic change (its
// ruling): a `restrict` over a filter, read as blockers are declared, so a
// creature that enters or loses flying later can't block either.

export default defineCard({
  name: "Tectonic Rift",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land. Creatures without flying can't block this turn.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "restrict", filter: { type: "creature", notKeyword: "flying" }, restrictions: ["cant-block"] },
    ],
  },
});
