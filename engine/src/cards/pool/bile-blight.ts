import { defineCard } from "../define.js";

// EDHREC rank 13001.
//
// One target; the creatures sharing its name (rule 201.2a) get -3/-3 with it,
// targeted or not (`CardFilter.sameNameAsTarget`).

export default defineCard({
  name: "Bile Blight",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature and all other creatures with the same name as that creature get -3/-3 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", sameNameAsTarget: 0 },
    power: -3,
    toughness: -3,
    duration: "end-of-turn",
  },
});
