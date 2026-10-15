import { defineCard } from "../define.js";

// EDHREC rank 15681. The return is optional ("up to one"); with a target
// chosen that's illegal on resolution, nothing happens, the search included
// (the ruling — rule 608.2b).

export default defineCard({
  name: "Proctor's Gaze",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Return up to one target nonland permanent to its owner's hand. Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  targets: [{ kind: "optional", of: "nonland-permanent" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
    ],
  },
});
