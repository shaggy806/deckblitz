import { defineCard } from "../define.js";

// The reveal compares with the permanent as it last existed on the
// battlefield (target slot 0, now on the bottom of the library).
export default defineCard({
  name: "Reality Scramble",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  retrace: true,
  text: "Put target permanent you own on the bottom of your library. Reveal cards from the top of your library until you reveal a card that shares a card type with that permanent. Put that card onto the battlefield and the rest on the bottom of your library in a random order.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  targets: [{ kind: "permanent", filter: { ownedBy: "you" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-bottom-of-library", target: 0 },
      { kind: "reveal-until", filter: { sharesCardTypeWith: 0 }, put: "battlefield", rest: "bottom-random" },
    ],
  },
});
