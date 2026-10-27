import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 12791.
//
// Rulings: it may target a permanent you own but don't control, and a token you
// own (which then ceases to exist). "Your library" is the owner's library, so
// `put-on-bottom-of-library` (the owner's) is the same place.

export default defineCard({
  name: "Tel-Jilad Stylus",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Put target permanent you own on the bottom of your library.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { ownedBy: "you" } }],
      effect: { kind: "put-on-bottom-of-library", target: 0 },
      resolve: null,
      text: "{T}: Put target permanent you own on the bottom of your library.",
    },
  ],
});
