import { defineCard } from "../define.js";

const TEXT =
  "{5}, {T}: Shuffle your library, then reveal the top card. Until end of turn, for as long as that card remains on top of your library, play with the top card of your library revealed and you may play that card without paying its mana cost. (If it has X in its mana cost, X is 0.)";

// EDHREC rank 23865. The revealed card is the `reveal-top`'s slot 0; the
// player effect lasts the turn and only while that card stays on top
// (`whileOnTop`): played, covered or the library shuffled, it's over for
// good (the rulings). While it lasts the top card *is* that card, so the
// permission reaches only it. A land is played as the turn's land play.
export default defineCard({
  name: "Temporal Aperture",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-library" },
          {
            kind: "reveal-top",
            then: {
              kind: "player-effect",
              duration: "end-of-turn",
              whileOnTop: 0,
              libraryTopRevealed: true,
              mayPlay: { from: "library-top", play: true, free: true },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
