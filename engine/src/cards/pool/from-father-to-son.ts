import { defineCard } from "../define.js";

// EDHREC rank 10862.
//
// "If this spell was cast from a graveyard" is the `source` condition's
// `castFrom` (Nibelheim Aflame): flashback is the usual way, but any cast
// from a graveyard counts. Either way the card found is revealed, and the
// search shuffles.
const TEXT =
  "Search your library for a Vehicle card, reveal it, and put it into your hand. If this spell was cast from a graveyard, put that card onto the battlefield instead. Then shuffle.";

export default defineCard({
  name: "From Father to Son",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: { cost: "{4}{W}{W}{W}" },
  text: `${TEXT}\nFlashback {4}{W}{W}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { castFrom: "graveyard" } },
    then: {
      kind: "search-library",
      filter: { subtype: "Vehicle" },
      destination: "battlefield",
      min: 0,
      max: 1,
      reveal: true,
    },
    else: {
      kind: "search-library",
      filter: { subtype: "Vehicle" },
      destination: "hand",
      min: 0,
      max: 1,
      reveal: true,
    },
  },
});
