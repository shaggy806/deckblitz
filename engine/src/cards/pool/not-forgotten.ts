import { defineCard } from "../define.js";

// EDHREC rank 18004.
//
// Rulings:
//   [2016-04-08] You choose whether to put the target card on the top or bottom of its owner's
//     library as Not Forgotten resolves.
//   [2016-04-08] You get the Spirit token, not the owner of the target card.
// "Your choice" is the caster's, as it resolves: a resolution-time `modal` of
// the two positions (put-on-library's `ownerChooses` would ask the card's
// owner instead). The token is the caster's, whoever owned the card.

export default defineCard({
  name: "Not Forgotten",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Put target card from a graveyard on your choice of the top or bottom of its owner's library. Create a 1/1 white Spirit creature token with flying.",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put it on top of its owner's library",
            effect: { kind: "put-on-library", target: 0, position: "top" },
          },
          {
            text: "Put it on the bottom of its owner's library",
            effect: { kind: "put-on-library", target: 0, position: "bottom" },
          },
        ],
      },
      { kind: "create-token", token: "Spirit Token", count: 1 },
    ],
  },
});
