import { defineCard } from "../define.js";

// EDHREC rank 12616.
//
// "Creatures without flying can't block this turn" is Sundering Eruption's
// `restrict` over a filter.

export default defineCard({
  name: "Fire of Orthanc",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target artifact or land. Creatures without flying can't block this turn.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "restrict", filter: { type: "creature", notKeyword: "flying" }, restrictions: ["cant-block"] },
    ],
  },
});
