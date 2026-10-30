import { defineCard } from "../define.js";

// EDHREC rank 26885. Eldritch Moon.
//
// One choice over both: an Eldrazi card in the caster's sideboard (rule
// 400.11a), revealed, or a face-up Eldrazi card they own in exile — never a
// face-down one, which has no characteristics (the ruling).

export default defineCard({
  name: "Coax from the Blind Eternities",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "You may reveal an Eldrazi card you own from outside the game or choose a face-up Eldrazi card you own in exile. Put that card into your hand.",
  effect: {
    kind: "search-library",
    filter: { subtype: "Eldrazi" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    outside: "only",
    faceUpExile: true,
  },
});
